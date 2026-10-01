const { query } = require('../database');

const selectFichas = `SELECT f.*, l.titulo_livro FROM public.ficha_catalografica f JOIN public.livro l ON l.id_livro = f.livro_id_livro`;

exports.listar = async (req, res) => {
    try {
        const result = await query(`${selectFichas} ORDER BY f.livro_id_livro`);
        res.json({ sucesso: true, fichas: result.rows });
    } catch (error) {
        console.error('Erro ao listar fichas:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar fichas catalográficas.' });
    }
};

exports.obter = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ sucesso: false, mensagem: 'ID do livro inválido.' });
        const result = await query(`${selectFichas} WHERE f.livro_id_livro = $1`, [id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Ficha não encontrada.' });
        res.json({ sucesso: true, ficha: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter ficha:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter ficha.' });
    }
};

exports.criar = async (req, res) => {
    try {
        const { livro_id_livro, assunto_ficha, palavras_chave_ficha, descricao_fisica_ficha, notas_ficha } = req.body;
        if (!livro_id_livro) return res.status(400).json({ sucesso: false, mensagem: 'O livro é obrigatório.' });
        const result = await query('INSERT INTO public.ficha_catalografica (livro_id_livro, assunto_ficha, palavras_chave_ficha, descricao_fisica_ficha, notas_ficha) VALUES ($1, $2, $3, $4, $5) RETURNING *', [livro_id_livro, assunto_ficha || null, palavras_chave_ficha || null, descricao_fisica_ficha || null, notas_ficha || null]);
        res.status(201).json({ sucesso: true, ficha: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar ficha:', error);
        res.status(error.code === '23503' || error.code === '23505' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Livro não encontrado.' : error.code === '23505' ? 'Este livro já possui uma ficha.' : 'Erro ao criar ficha.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const { assunto_ficha, palavras_chave_ficha, descricao_fisica_ficha, notas_ficha } = req.body;
        const result = await query('UPDATE public.ficha_catalografica SET assunto_ficha = $1, palavras_chave_ficha = $2, descricao_fisica_ficha = $3, notas_ficha = $4 WHERE livro_id_livro = $5 RETURNING *', [assunto_ficha || null, palavras_chave_ficha || null, descricao_fisica_ficha || null, notas_ficha || null, id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Ficha não encontrada.' });
        res.json({ sucesso: true, ficha: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar ficha:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar ficha.' });
    }
};

exports.deletar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        await query('DELETE FROM public.ficha_catalografica WHERE livro_id_livro = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Ficha excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar ficha:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir ficha.' });
    }
};
