const API = 'http://localhost:3001/autor';
let operacao = '';
const campos = ['nome', 'nacionalidade'];
const $ = id => document.getElementById(id);
const aviso = texto => $('mensagem').textContent = texto;

function editar(liberar) {
	campos.forEach(id => $(id).disabled = !liberar);
	$('id').readOnly = liberar;
}

function botoes(estado) {
	$('procurar').hidden = !estado.busca;
	$('inserir').hidden = !estado.inserir;
	$('alterar').hidden = !estado.alterar;
	$('excluir').hidden = !estado.excluir;
	$('salvar').hidden = !estado.salvar;
	$('cancelar').hidden = !estado.salvar;
}

function limpar() {
	campos.forEach(id => $(id).value = '');
}

async function procurar() {
	const id = $('id').value;
	if (!id) return aviso('Informe um ID válido.');

	const resposta = await fetch(`${API}/${id}`);
	const dados = await resposta.json();

	if (dados.sucesso) {
		$('nome').value = dados.autor.nome_autor || '';
		$('nacionalidade').value = dados.autor.nacionalidade_autor || '';
		editar(false);
		botoes({ busca: true, alterar: true, excluir: true });
		aviso('Autor encontrado.');
	} else {
		limpar();
		editar(true);
		botoes({ busca: true, inserir: true });
		aviso('Autor não encontrado. Você pode inserir.');
	}
}

function preparar(tipo) {
	operacao = tipo;
	editar(true);
	botoes({ salvar: true });
	aviso(`${tipo === 'inserindo' ? 'Inserindo' : tipo === 'alterando' ? 'Alterando' : 'Excluindo'}: clique em Salvar.`);
}

async function salvar() {
	const id = $('id').value;

	if (operacao === 'excluindo') {
		await fetch(`${API}/${id}`, { method: 'DELETE' });
	} else {
		const corpo = {
			id_autor: id,
			nome_autor: $('nome').value,
			nacionalidade_autor: $('nacionalidade').value
		};

		await fetch(operacao === 'inserindo' ? API : `${API}/${id}`, {
			method: operacao === 'inserindo' ? 'POST' : 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo)
		});
	}

	cancelar();
	await listar();
}

async function listar() {
	try {
		const resposta = await fetch(`${API}/listar`);
		const dados = await resposta.json();
		$('lista').innerHTML = dados.sucesso && dados.autores.length
			? dados.autores.map(autor => `<div><b>${autor.id_autor}</b> · ${autor.nome_autor} ${autor.nacionalidade_autor ? `(${autor.nacionalidade_autor})` : ''}</div>`).join('')
			: 'Nenhum autor cadastrado.';
	} catch {
		$('lista').textContent = 'Servidor offline.';
	}
}

function cancelar() {
	operacao = '';
	editar(false);
	botoes({ busca: true });
	aviso('Informe um ID e clique em Procurar.');
}

$('procurar').onclick = procurar;
$('inserir').onclick = () => preparar('inserindo');
$('alterar').onclick = () => preparar('alterando');
$('excluir').onclick = () => preparar('excluindo');
$('salvar').onclick = salvar;
$('cancelar').onclick = cancelar;
editar(false);
listar();
