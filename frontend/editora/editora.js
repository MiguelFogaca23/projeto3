const API = 'http://localhost:3001/editora';
let operacao = '';
const campos = ['nome', 'cidade', 'site'];
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
		$('nome').value = dados.editora.nome_editora || '';
		$('cidade').value = dados.editora.cidade_editora || '';
		$('site').value = dados.editora.site_editora || '';
		editar(false);
		botoes({ busca: true, alterar: true, excluir: true });
		aviso('Editora encontrada.');
	} else {
		limpar();
		editar(true);
		botoes({ busca: true, inserir: true });
		aviso('Editora não encontrada. Você pode inserir.');
	}
}

function preparar(tipo) {
	operacao = tipo;
	editar(true);
	botoes({ salvar: true });
	aviso('Preencha os dados e clique em Salvar.');
}

async function salvar() {
	const id = $('id').value;

	if (operacao === 'excluindo') {
		await fetch(`${API}/${id}`, { method: 'DELETE' });
	} else {
		const corpo = {
			id_editora: id,
			nome_editora: $('nome').value,
			cidade_editora: $('cidade').value,
			site_editora: $('site').value
		};

		await fetch(operacao === 'inserindo' ? API : `${API}/${id}`, {
			method: operacao === 'inserindo' ? 'POST' : 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo)
		});
	}

	cancelar();
	listar();
}

async function listar() {
	try {
		const resposta = await fetch(`${API}/listar`);
		const dados = await resposta.json();
		$('lista').innerHTML = dados.sucesso && dados.editoras.length
			? dados.editoras.map(editora => `<div><b>${editora.id_editora}</b> · ${editora.nome_editora}${editora.cidade_editora ? ` · ${editora.cidade_editora}` : ''}</div>`).join('')
			: 'Nenhuma editora cadastrada.';
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
