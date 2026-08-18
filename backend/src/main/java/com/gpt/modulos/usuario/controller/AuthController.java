package com.gpt.modulos.usuario.controller;

import com.gpt.modulos.usuario.dto.LoginRequestDTO;
import com.gpt.modulos.usuario.dto.LoginResponseDTO;
import com.gpt.modulos.usuario.dto.RegistroRequestDTO;
import com.gpt.modulos.usuario.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.autenticar(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        LoginResponseDTO response = authService.registrar(request);
        return ResponseEntity.ok(response);
    }
}