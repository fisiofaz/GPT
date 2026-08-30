package com.gpt.modulos.publicacao.enums;

public enum IdiomaPublicacao {
    PORTUGUES("Português"),
    ESPANHOL("Espanhol"),
    INGLES("Inglês"),
    LIBRAS("Libras / Língua de Sinais Brasileira"),
    LINGUA_INDIGENA("Língua Indígena (Guarani, Ticuna, etc.)"),
    ALEMAO("Alemão"),
    CRIOLO_HAITIANO("Crioulo Haitiano"),
    JAPONES("Japonês"),
    OUTRO("Outro Idioma");

    private final String descricao;

    IdiomaPublicacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}