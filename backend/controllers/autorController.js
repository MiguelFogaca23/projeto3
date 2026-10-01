const { query } = require('../database');

exports.listar = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.autor ORDER BY id_autor');
        res.json({ sucesso: true, autores: result.rows });
    } catch (error) {
        console.error('Erro ao listar autores:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar autores.' });
    }
};

exports.obter = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        const result = await query('SELECT * FROM public.autor WHERE id_autor = $1', [id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Autor não encontrado.' });
        res.json({ sucesso: true, autor: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter autor:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter autor.' });
    }
};

exports.criar = async (req, res) => {
    try {
        const { id_autor, nome_autor, nacionalidade_autor } = req.body;
        if (!nome_autor) return res.status(400).json({ sucesso: false, mensagem: 'O nome do autor é obrigatório.' });
        const result = await query('INSERT INTO public.autor (id_autor, nome_autor, nacionalidade_autor) VALUES ($1, $2, $3) RETURNING *', [id_autor || null, nome_autor, nacionalidade_autor || null]);
        res.status(201).json({ sucesso: true, autor: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar autor:', error);
        res.status(error.code === '23505' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23505' ? 'Este ID de autor já está cadastrado.' : 'Erro ao criar autor.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const { nome_autor, nacionalidade_autor } = req.body;
        const result = await query('UPDATE public.autor SET nome_autor = $1, nacionalidade_autor = $2 WHERE id_autor = $3 RETURNING *', [nome_autor, nacionalidade_autor || null, id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Autor não encontrado.' });
        res.json({ sucesso: true, autor: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar autor:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar autor.' });
    }
};

exports.deletar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        await query('DELETE FROM public.autor WHERE id_autor = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Autor excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar autor:', error);
        res.status(error.code === '23503' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Não é possível excluir um autor com livros cadastrados.' : 'Erro ao excluir autor.' });
    }
};
