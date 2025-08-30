const db = require('../config/db');

const getHourFromDB = async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            message: 'Conexão com o banco de dados bem-sucedida!',
            database_time: result.rows[0].now,
        });
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        res.status(500).json({ message: 'Erro ao conectar ao banco de dados.' });
    }
};


module.exports = {
    getHourFromDB
};