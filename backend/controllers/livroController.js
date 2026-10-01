const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const selectLivros = `SELECT l.*, a.nome_autor, e.nome_editora FROM public.livro l JOIN public.autor a ON a.id_autor = l.autor_id_autor LEFT JOIN public.editora e ON e.id_editora = l.editora_id_editora`;

exports.listar = async (req, res) => {
    try {
        const result = await query(`${selectLivros} ORDER BY l.id_livro`);
        res.json({ sucesso: true, livros: result.rows });
    } catch (error) {
        console.error('Erro ao listar livros:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar livros.' });
    }
};

exports.obter = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        const result = await query(`${selectLivros} WHERE l.id_livro = $1`, [id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Livro não encontrado.' });
        res.json({ sucesso: true, livro: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter livro:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter livro.' });
    }
};

exports.criar = async (req, res) => {
    try {
        const { id_livro, titulo_livro, isbn_livro, ano_publicacao_livro, autor_id_autor, editora_id_editora, numero_edicao_livro } = req.body;
        if (!titulo_livro || !autor_id_autor) return res.status(400).json({ sucesso: false, mensagem: 'Título e autor são obrigatórios.' });
        const result = await query('INSERT INTO public.livro (id_livro, titulo_livro, isbn_livro, ano_publicacao_livro, autor_id_autor, editora_id_editora, numero_edicao_livro) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [id_livro || null, titulo_livro, isbn_livro || null, ano_publicacao_livro || null, autor_id_autor, editora_id_editora || null, numero_edicao_livro || null]);
        res.status(201).json({ sucesso: true, livro: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar livro:', error);
        res.status(error.code === '23503' || error.code === '23505' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Autor ou editora não encontrada.' : error.code === '23505' ? 'Este ID de livro já está cadastrado.' : 'Erro ao criar livro.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const { titulo_livro, isbn_livro, ano_publicacao_livro, autor_id_autor, editora_id_editora, numero_edicao_livro } = req.body;
        const result = await query('UPDATE public.livro SET titulo_livro = $1, isbn_livro = $2, ano_publicacao_livro = $3, autor_id_autor = $4, editora_id_editora = $5, numero_edicao_livro = $6 WHERE id_livro = $7 RETURNING *', [titulo_livro, isbn_livro || null, ano_publicacao_livro || null, autor_id_autor, editora_id_editora || null, numero_edicao_livro || null, id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Livro não encontrado.' });
        res.json({ sucesso: true, livro: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(error.code === '23503' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Autor ou editora não encontrada.' : 'Erro ao atualizar livro.' });
    }
};

exports.uploadCapa = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ sucesso: false, mensagem: 'Nenhuma capa foi enviada.' });
        const pasta = path.join(__dirname, '../../imagens');
        fs.mkdirSync(pasta, { recursive: true });
        await sharp(req.file.buffer).resize(300, 420, { fit: 'cover' }).png().toFile(path.join(pasta, `livro-${req.params.id}.png`));
        res.json({ sucesso: true, mensagem: 'Capa salva com sucesso.' });
    } catch (error) {
        console.error('Erro ao salvar capa:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar capa.' });
    }
};

exports.deletar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        await query('DELETE FROM public.livro WHERE id_livro = $1', [id]);
        const capa = path.join(__dirname, '../../imagens', `livro-${id}.png`);
        if (fs.existsSync(capa)) fs.unlinkSync(capa);
        res.json({ sucesso: true, mensagem: 'Livro excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        res.status(error.code === '23503' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Exclua a ficha catalográfica antes do livro.' : 'Erro ao excluir livro.' });
    }
};
