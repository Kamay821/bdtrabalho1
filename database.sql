CREATE DATABASE IF NOT EXISTS biblioteca_db;
USE biblioteca_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) UNIQUE NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_emprestimo DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_devolucao DATETIME NULL,
    usuario_id INT NOT NULL,
    livro_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (livro_id) REFERENCES livros(id)
);

INSERT INTO usuarios (nome, email) VALUES 
('Carlos Abreu', 'carlos@iprj.uerj.br'),
('Thiago Paixão', 'thiago@serrajr.com'),
('Michel Gonçalves', 'michel@iprj.uerj.br');

INSERT INTO livros (titulo, autor, isbn, disponivel) VALUES 
('Engenharia de Software', 'Roger Pressman', '978-123456', TRUE),
('Sistemas de Banco de Dados', 'Elmasri & Navathe', '978-654321', TRUE),
('Clean Code', 'Robert C. Martin', '978-112233', TRUE),
('O Hobbit', 'J.R.R. Tolkien', '978-998877', TRUE);

INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo) VALUES (1, 4, NOW());
UPDATE livros SET disponivel = FALSE WHERE id = 4;