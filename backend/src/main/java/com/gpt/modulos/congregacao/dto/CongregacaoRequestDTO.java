package com.gpt.modulos.congregacao.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CongregacaoRequestDTO {

    @NotBlank(message = "O nome da congregação é obrigatório")
    @Size(max = 150, message = "O nome não pode ter mais de 150 caracteres")
    private String nome;
    
    @NotBlank(message = "O número da congregação é obrigatório")
    @Size(max = 10, message = "O número não pode ter mais de 150 caracteres")
    private String numero;

    @Size(max = 30, message = "O número do circuito não pode ter mais de 30 caracteres")
    private String numeroCircuito;
    
    @NotBlank(message = "A cidade é obrigatória")
    @Size(max = 100, message = "A cidade não pode ter mais de 100 caracteres")
    private String cidade;

    @NotBlank(message = "O estado (UF) é obrigatório")
    @Pattern(
    	    regexp = "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO",
    	    message = "O estado deve ser uma UF válida"
    )
    private String estado;
}