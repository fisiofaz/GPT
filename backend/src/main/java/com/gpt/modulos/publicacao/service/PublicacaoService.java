package com.gpt.modulos.publicacao.service;

import com.gpt.config.security.SecurityUtils;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.model.PublicacaoEstoque;
import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.publicacao.dto.EstatisticasPublicacaoResponseDTO;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.publicacao.dto.PublicacaoRequestDTO;
import com.gpt.modulos.publicacao.dto.PublicacaoResponseDTO;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.usuario.model.Usuario;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicacaoService {

    private final PublicacaoRepository publicacaoRepository;
    private final PublicacaoEstoqueRepository publicacaoEstoqueRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<PublicacaoResponseDTO> listarPorCongregacao(
            Long congregacaoId
    ) {
        return publicacaoEstoqueRepository
                .findByCongregacaoIdAndAtivoTrueOrderByPublicacaoTituloAsc(
                        congregacaoId
                )
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    @Transactional
    public PublicacaoResponseDTO cadastrar(
            PublicacaoRequestDTO dto,
            Usuario responsavel
    ) {

        if (dto.congregacaoId() == null) {
            throw new IllegalArgumentException(
            		"A congregação é obrigatória para associar o estoque."
            );
        }

        Congregacao congregacao = congregacaoRepository
                .findById(dto.congregacaoId())
                .orElseThrow(() -> new IllegalArgumentException(
                		 "Congregação não encontrada."
                ));
        
        String codigo = dto.codigo().trim().toUpperCase();
        
        Publicacao publicacao = publicacaoRepository
                .findByCodigoIgnoreCase(codigo)
                .orElse(null);

        if (publicacao != null) {
            if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
                throw new IllegalArgumentException(
                        "A publicação está inativa e não pode receber novo estoque."
                );
            }

            if (publicacaoEstoqueRepository
                    .existsByPublicacaoIdAndCongregacaoId(
                            publicacao.getId(),
                            congregacao.getId()
                    )) {
                throw new IllegalArgumentException(
                        "Já existe estoque cadastrado para esta publicação "
                        + "nesta congregação."
                );
            }
        } else {
            publicacao = Publicacao.builder()
                    .codigo(codigo)
                    .titulo(dto.titulo().trim())
                    .categoria(dto.categoria())
                    .formato(dto.formato() != null
                            ? dto.formato()
                            : FormatoPublicacao.NORMAL)
                    .idioma(dto.idioma() != null
                            ? dto.idioma()
                            : IdiomaPublicacao.PORTUGUES)
                    .ativo(true)
                    .build();

            publicacao = publicacaoRepository.saveAndFlush(publicacao);
        }
        
        PublicacaoEstoque estoque = PublicacaoEstoque.builder()
        		.publicacao(publicacao)
                .congregacao(congregacao)
                .quantidade(0)
                .estoqueMinimo(dto.estoqueMinimo() != null
                        ? dto.estoqueMinimo()
                        : 5)
                .ativo(true)
                .build();

        estoque = publicacaoEstoqueRepository.save(estoque);

        return converterParaResponseDTO(estoque);
    }

    @Transactional
    public PublicacaoResponseDTO atualizar(
            Long id,
            PublicacaoRequestDTO dto
    ) {
    	
    	 if (dto.congregacaoId() == null) {
    	        throw new IllegalArgumentException(
    	                "A congregação é obrigatória para atualizar o estoque."
    	        );
    	    }

    	 Publicacao publicacao = publicacaoRepository.findById(id)
    	            .orElseThrow(() -> new IllegalArgumentException(
    	                    "Publicação não encontrada."
    	            ));
    	 
    	 PublicacaoEstoque estoque = publicacaoEstoqueRepository
    	            .findByPublicacaoIdAndCongregacaoId(
    	                    id,
    	                    dto.congregacaoId()
    	            )
    	            .orElseThrow(() -> new IllegalArgumentException(
    	                    "Estoque da publicação não encontrado para a congregação."
    	            ));

        publicacao.setTitulo(dto.titulo().trim());
        publicacao.setCategoria(dto.categoria());

        if (dto.formato() != null) {
            publicacao.setFormato(dto.formato());
        }


        if (dto.idioma() != null) {
            publicacao.setIdioma(dto.idioma());
        }
        
        publicacaoRepository.save(publicacao);

        if (dto.estoqueMinimo() != null) {
            estoque.setEstoqueMinimo(dto.estoqueMinimo());
            estoque = publicacaoEstoqueRepository.save(estoque);
        }

       return converterParaResponseDTO(estoque);
    }


	@Transactional
	public void deletar(Long id, Long congregacaoId) {
	    PublicacaoEstoque estoque = publicacaoEstoqueRepository
	        .findByPublicacaoIdAndCongregacaoId(id, congregacaoId)
	        .orElseThrow(() -> new IllegalArgumentException(
	            "Estoque da publicação não encontrado para esta congregação."
	        ));
	
	    if (!Boolean.TRUE.equals(estoque.getAtivo())) {
	        throw new IllegalArgumentException(
	            "Esta publicação já foi removida do estoque ativo da congregação."
	        );
	    }
	
	    estoque.setAtivo(false);
	    publicacaoEstoqueRepository.save(estoque);
	}

    private PublicacaoResponseDTO converterParaResponseDTO(
            PublicacaoEstoque estoque
    ) {

        Publicacao publicacao = estoque.getPublicacao();
        Congregacao congregacao = estoque.getCongregacao();

        int quantidade = estoque.getQuantidade() != null
                ? estoque.getQuantidade()
                : 0;

        int minimo = estoque.getEstoqueMinimo() != null
                ? estoque.getEstoqueMinimo()
                : 0;

        return new PublicacaoResponseDTO(
                publicacao.getId(),
                publicacao.getCodigo(),
                publicacao.getTitulo(),
                publicacao.getCategoria(),
                publicacao.getFormato(),
                publicacao.getIdioma(),
                quantidade,
                minimo,
                quantidade <= minimo,
                congregacao.getId(),
                congregacao.getNome(),
                publicacao.getAtivo() && estoque.getAtivo(),
                publicacao.getCriadoEm()
        );
    }
    

	@Transactional(readOnly = true)
	public EstatisticasPublicacaoResponseDTO obterEstatisticas(
	        Long congregacaoIdSolicitada,
	        LocalDate inicio,
	        LocalDate fim) {
	
	    Long congregacaoId = getCongregacaoIdObrigatoria(
	        congregacaoIdSolicitada
	    );
	
	    if (inicio == null || fim == null) {
	        throw new IllegalArgumentException(
	            "As datas inicial e final são obrigatórias."
	        );
	    }
	
	    if (inicio.isAfter(fim)) {
	        throw new IllegalArgumentException(
	            "A data inicial não pode ser posterior à data final."
	        );
	    }
	
	    LocalDateTime inicioPeriodo = inicio.atStartOfDay();
	    LocalDateTime fimPeriodoExclusivo = fim.plusDays(1).atStartOfDay();
	
	    long entradas = movimentacaoEstoqueRepository
	        .countByCongregacaoAndTipoNoPeriodo(
	            congregacaoId,
	            TipoMovimentacao.ENTRADA,
	            inicioPeriodo,
	            fimPeriodoExclusivo
	        );
	
	    long saidas = movimentacaoEstoqueRepository
	        .countByCongregacaoAndTipoNoPeriodo(
	            congregacaoId,
	            TipoMovimentacao.SAIDA,
	            inicioPeriodo,
	            fimPeriodoExclusivo
	        );
	
	    long ajustes = movimentacaoEstoqueRepository
	        .countByCongregacaoAndTipoNoPeriodo(
	            congregacaoId,
	            TipoMovimentacao.AJUSTE,
	            inicioPeriodo,
	            fimPeriodoExclusivo
	        );
	
	    long exemplaresEntrados = movimentacaoEstoqueRepository
	        .sumQuantidadeByCongregacaoAndTipoNoPeriodo(
	            congregacaoId,
	            TipoMovimentacao.ENTRADA,
	            inicioPeriodo,
	            fimPeriodoExclusivo
	        );
	
	    long exemplaresSaidos = movimentacaoEstoqueRepository
	        .sumQuantidadeByCongregacaoAndTipoNoPeriodo(
	            congregacaoId,
	            TipoMovimentacao.SAIDA,
	            inicioPeriodo,
	            fimPeriodoExclusivo
	        );
	
	    return EstatisticasPublicacaoResponseDTO.builder()
	        .totalPublicacoes(
	            publicacaoEstoqueRepository.countByCongregacaoId(congregacaoId)
	        )
	        .estoquesAtivos(
	            publicacaoEstoqueRepository
	                .countEstoquesAtivosByCongregacaoId(congregacaoId)
	        )
	        .estoquesBaixos(
	            publicacaoEstoqueRepository
	                .countEstoquesBaixosByCongregacaoId(congregacaoId)
	        )
	        .estoquesZerados(
	            publicacaoEstoqueRepository
	                .countEstoquesZeradosByCongregacaoId(congregacaoId)
	        )
	        .totalExemplares(
	            publicacaoEstoqueRepository
	                .sumQuantidadeAtivaByCongregacaoId(congregacaoId)
	        )
	        .entradasNoPeriodo(entradas)
	        .saidasNoPeriodo(saidas)
	        .ajustesNoPeriodo(ajustes)
	        .exemplaresEntradosNoPeriodo(exemplaresEntrados)
	        .exemplaresSaidosNoPeriodo(exemplaresSaidos)
	        .build();
	}
	

	private boolean isAdminGeral() {
	    return securityUtils.getUsuarioLogado()
	        .map(usuario -> usuario.getRoles().stream()
	            .anyMatch(role ->
	                "ROLE_ADMIN_GERAL".equals(role.getNome())
	            )
	        )
	        .orElse(false);
	}
	
	private Long getCongregacaoIdObrigatoria(
	        Long congregacaoIdSolicitada) {
	
	    if (congregacaoIdSolicitada == null) {
	        throw new IllegalArgumentException(
	            "A congregação é obrigatória."
	        );
	    }
	
	    if (isAdminGeral()) {
	        return congregacaoIdSolicitada;
	    }
	
	    Long congregacaoIdLogada =
	        securityUtils.getCongregacaoIdLogada();
	
	    if (congregacaoIdLogada == null) {
	        throw new AccessDeniedException(
	            "Usuário autenticado não possui uma congregação vinculada."
	        );
	    }
	
	    if (!congregacaoIdLogada.equals(congregacaoIdSolicitada)) {
	        throw new AccessDeniedException(
	            "Você não tem permissão para acessar outra congregação."
	        );
	    }
	
	    return congregacaoIdLogada;
	}

}