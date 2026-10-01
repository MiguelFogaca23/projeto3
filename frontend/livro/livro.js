const API = 'http://localhost:3001';
let operacao = '';
const $ = id => document.getElementById(id);
const aviso = texto => $('mensagem').textContent = texto;
const campos = ['titulo', 'autor', 'editora', 'isbn', 'ano', 'edicao', 'imagem'];

function editar(liberar) {
	campos.forEach(id => $(id).disabled = !liberar);
	$('id').readOnly = liberar;
}

function botoes(estado) {
	['procurar', 'inserir', 'alterar', 'excluir', 'salvar', 'cancelar']
		.forEach(id => $(id).hidden = !estado[id]);
}

async function opcoes() {
	const [autores, editoras] = await Promise.all([
		fetch(`${API}/autor/listar`).then(resposta => resposta.json()),
		fetch(`${API}/editora/listar`).then(resposta => resposta.json())
	]);

	$('autor').innerHTML = '<option value="">Selecione um autor</option>'
		+ autores.autores.map(autor => `<option value="${autor.id_autor}">${autor.nome_autor}</option>`).join('');
	$('editora').innerHTML = '<option value="">Sem editora</option>'
		+ editoras.editoras.map(editora => `<option value="${editora.id_editora}">${editora.nome_editora}</option>`).join('');
}

function limpar() {
	['titulo', 'isbn', 'ano', 'edicao'].forEach(id => $(id).value = '');
	$('autor').value = '';
	$('editora').value = '';
	$('imagem').value = '';
	$('capa').removeAttribute('src');
}

function preencher(livro) {
	$('titulo').value = livro.titulo_livro || '';
	$('autor').value = livro.autor_id_autor;
	$('editora').value = livro.editora_id_editora || '';
	$('isbn').value = livro.isbn_livro || '';
	$('ano').value = livro.ano_publicacao_livro || '';
	$('edicao').value = livro.numero_edicao_livro || '';
	$('capa').src = `${API.replace('/livro', '')}/imagens/livro-${livro.id_livro}.png?t=${Date.now()}`;
}

async function procurar() {
	const id = $('id').value;
	if (!id) return aviso('Informe um ID válido.');

	const resposta = await fetch(`${API}/livro/${id}`);
	const dados = await resposta.json();

	if (dados.sucesso) {
		preencher(dados.livro);
		editar(false);
		botoes({ procurar: true, alterar: true, excluir: true });
		aviso('Livro encontrado.');
	} else {
		limpar();
		editar(true);
		botoes({ procurar: true, inserir: true });
		aviso('Livro não encontrado. Você pode inserir.');
	}
}

function preparar(tipo) {
	operacao = tipo;
	editar(tipo !== 'excluindo');
	botoes({ salvar: true, cancelar: true });
	aviso('Preencha os dados e clique em Salvar.');
}

async function salvar() {
	const id = $('id').value;

	if (operacao === 'excluindo') {
		await fetch(`${API}/livro/${id}`, { method: 'DELETE' });
	} else {
		const corpo = {
			id_livro: id,
			titulo_livro: $('titulo').value,
			autor_id_autor: $('autor').value,
			editora_id_editora: $('editora').value,
			isbn_livro: $('isbn').value,
			ano_publicacao_livro: $('ano').value,
			numero_edicao_livro: $('edicao').value
		};
		const resposta = await fetch(operacao === 'inserindo' ? `${API}/livro` : `${API}/livro/${id}`, {
			method: operacao === 'inserindo' ? 'POST' : 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo)
		});
		const dados = await resposta.json();
		if (!dados.sucesso) return aviso(dados.mensagem);

		const livroId = dados.livro.id_livro;
		$('id').value = livroId;
		if ($('imagem').files.length) {
			const formulario = new FormData();
			formulario.append('imagem', $('imagem').files[0]);
			await fetch(`${API}/livro/upload/${livroId}`, {
				method: 'POST',
				body: formulario
			});
		}
	}

	cancelar();
	listar();
}

async function listar() {
	try {
		const resposta = await fetch(`${API}/livro/listar`);
		const dados = await resposta.json();
		$('lista').innerHTML = dados.livros?.length
			? dados.livros.map(livro => `<div><b>${livro.id_livro}</b> · ${livro.titulo_livro} · ${livro.nome_autor}${livro.nome_editora ? ` · ${livro.nome_editora}` : ''}</div>`).join('')
			: 'Nenhum livro cadastrado.';
	} catch {
		$('lista').textContent = 'Servidor offline.';
	}
}

function cancelar() {
	operacao = '';
	editar(false);
	botoes({ procurar: true, inserir: true });
	aviso('Informe um ID e clique em Procurar.');
}

$('imagem').onchange = () => {
	if ($('imagem').files[0]) {
		$('capa').src = URL.createObjectURL($('imagem').files[0]);
	}
};

$('procurar').onclick = procurar;
$('inserir').onclick = () => preparar('inserindo');
$('alterar').onclick = () => preparar('alterando');
$('excluir').onclick = () => preparar('excluindo');
$('salvar').onclick = salvar;
$('cancelar').onclick = cancelar;
editar(false);
opcoes().then(listar);
