const { query } = require('../database');

exports.listar = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.editora ORDER BY id_editora');
        res.json({ sucesso: true, editoras: result.rows });
    } catch (error) {
        console.error('Erro ao listar editoras:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar editoras.' });
    }
};

exports.obter = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(id)) return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        const result = await query('SELECT * FROM public.editora WHERE id_editora = $1', [id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Editora não encontrada.' });
        res.json({ sucesso: true, editora: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter editora:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter editora.' });
    }
};

exports.criar = async (req, res) => {
    try {
        const { id_editora, nome_editora, cidade_editora, site_editora } = req.body;
        if (!nome_editora) return res.status(400).json({ sucesso: false, mensagem: 'O nome da editora é obrigatório.' });
        const result = await query('INSERT INTO public.editora (id_editora, nome_editora, cidade_editora, site_editora) VALUES ($1, $2, $3, $4) RETURNING *', [id_editora || null, nome_editora, cidade_editora || null, site_editora || null]);
        res.status(201).json({ sucesso: true, editora: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar editora:', error);
        res.status(error.code === '23505' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23505' ? 'Este ID de editora já está cadastrado.' : 'Erro ao criar editora.' });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        const { nome_editora, cidade_editora, site_editora } = req.body;
        const result = await query('UPDATE public.editora SET nome_editora = $1, cidade_editora = $2, site_editora = $3 WHERE id_editora = $4 RETURNING *', [nome_editora, cidade_editora || null, site_editora || null, id]);
        if (!result.rows.length) return res.status(404).json({ sucesso: false, mensagem: 'Editora não encontrada.' });
        res.json({ sucesso: true, editora: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar editora:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar editora.' });
    }
};

exports.deletar = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        await query('DELETE FROM public.editora WHERE id_editora = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Editora excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar editora:', error);
        res.status(error.code === '23503' ? 400 : 500).json({ sucesso: false, mensagem: error.code === '23503' ? 'Não é possível excluir uma editora com livros cadastrados.' : 'Erro ao excluir editora.' });
    }
};
