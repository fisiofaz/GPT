-- Hash garantido do BCrypt para a senha 'admin123'
UPDATE tb_usuario 
SET senha = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi' 
WHERE email = 'admin@gpt.com';