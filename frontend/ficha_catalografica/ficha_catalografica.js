const API = 'http://localhost:3001';
let operacao = '';
const $ = id => document.getElementById(id);
const aviso = texto => $('mensagem').textContent = texto;
const campos = ['assunto', 'palavras', 'descricao', 'notas'];

function editar(liberar) {
	campos.forEach(id => $(id).disabled = !liberar);
	$('livro').disabled = !liberar;
}

function botoes(estado) {
	['procurar', 'inserir', 'alterar', 'excluir', 'salvar', 'cancelar']
		.forEach(id => $(id).hidden = !estado[id]);
}

async function livros() {
	const resposta = await fetch(`${API}/livro/listar`);
	const dados = await resposta.json();
	$('livro').innerHTML = '<option value="">Selecione um livro</option>'
		+ (dados.livros || []).map(livro => `<option value="${livro.id_livro}">${livro.id_livro} · ${livro.titulo_livro}</option>`).join('');
}

function limpar() {
	campos.forEach(id => $(id).value = '');
}

function preencher(ficha) {
	$('assunto').value = ficha.assunto_ficha || '';
	$('palavras').value = ficha.palavras_chave_ficha || '';
	$('descricao').value = ficha.descricao_fisica_ficha || '';
	$('notas').value = ficha.notas_ficha || '';
}

async function procurar() {
	const id = $('livro').value;
	if (!id) return aviso('Selecione um livro.');

	const resposta = await fetch(`${API}/ficha_catalografica/${id}`);
	const dados = await resposta.json();

	if (dados.sucesso) {
		preencher(dados.ficha);
		editar(false);
		botoes({ procurar: true, alterar: true, excluir: true });
		aviso('Ficha encontrada.');
	} else {
		limpar();
		editar(true);
		botoes({ procurar: true, inserir: true });
		aviso('Ficha não encontrada. Você pode inserir.');
	}
}

function preparar(tipo) {
	operacao = tipo;
	editar(tipo !== 'excluindo');
	botoes({ salvar: true, cancelar: true });
	aviso('Preencha os dados e clique em Salvar.');
}

async function salvar() {
	const id = $('livro').value;

	if (operacao === 'excluindo') {
		await fetch(`${API}/ficha_catalografica/${id}`, { method: 'DELETE' });
	} else {
		const corpo = {
			livro_id_livro: id,
			assunto_ficha: $('assunto').value,
			palavras_chave_ficha: $('palavras').value,
			descricao_fisica_ficha: $('descricao').value,
			notas_ficha: $('notas').value
		};
		const resposta = await fetch(operacao === 'inserindo' ? `${API}/ficha_catalografica` : `${API}/ficha_catalografica/${id}`, {
			method: operacao === 'inserindo' ? 'POST' : 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo)
		});
		const dados = await resposta.json();
		if (!dados.sucesso) return aviso(dados.mensagem);
	}

	cancelar();
	listar();
}

async function listar() {
	try {
		const resposta = await fetch(`${API}/ficha_catalografica/listar`);
		const dados = await resposta.json();
		$('lista').innerHTML = dados.fichas?.length
			? dados.fichas.map(ficha => `<div><b>${ficha.livro_id_livro}</b> · ${ficha.titulo_livro} · ${ficha.assunto_ficha || 'Sem assunto'}</div>`).join('')
			: 'Nenhuma ficha cadastrada.';
	} catch {
		$('lista').textContent = 'Servidor offline.';
	}
}

function cancelar() {
	operacao = '';
	editar(false);
	botoes({ procurar: true, inserir: true });
	aviso('Selecione um livro e clique em Procurar.');
}

$('procurar').onclick = procurar;
$('inserir').onclick = () => preparar('inserindo');
$('alterar').onclick = () => preparar('alterando');
$('excluir').onclick = () => preparar('excluindo');
$('salvar').onclick = salvar;
$('cancelar').onclick = cancelar;
editar(false);
livros().then(listar);
