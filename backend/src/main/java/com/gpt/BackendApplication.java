package com.gpt;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gpt.modulos.usuario.repository.UsuarioRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner corrigirSenhaAdmin(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			usuarioRepository.findByEmail("admin@gpt.com").ifPresent(admin -> {
				admin.setSenha(passwordEncoder.encode("admin123"));
				usuarioRepository.save(admin);
				System.out.println("[SUCESSO] Senha do admin redefinida automaticamente pela aplicacao!");
			});
		};
	}
}
