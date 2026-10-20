package com.gpt.modulos.pedido.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.dto.MovimentacaoEstoqueDTO;
import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;
import com.gpt.modulos.movimentacao.service.MovimentacaoService;
import com.gpt.modulos.pedido.dto.PedidoBetelDTO;
import com.gpt.modulos.pedido.dto.PedidoPublicadorDTO;
import com.gpt.modulos.pedido.enums.OrigemItemPedido;
import com.gpt.modulos.pedido.enums.StatusPedidoBetel;
import com.gpt.modulos.pedido.enums.StatusPedidoPublicador;
import com.gpt.modulos.pedido.model.ItemPedidoBetel;
import com.gpt.modulos.pedido.model.PedidoBetel;
import com.gpt.modulos.pedido.model.PedidoPublicador;
import com.gpt.modulos.pedido.repository.PedidoBetelRepository;
import com.gpt.modulos.pedido.repository.PedidoPublicadorRepository;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.publicacao.model.CatalogoMestre;
import com.gpt.modulos.publicacao.repository.CatalogoMestreRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoPublicadorRepository pedidoPublicadorRepo;
    private final PedidoBetelRepository pedidoBetelRepo;
    private final PublicadorRepository publicadorRepo;
    private final PublicacaoRepository publicacaoRepo;
    private final CongregacaoRepository congregacaoRepo;
    private final UsuarioRepository usuarioRepo;
    private final MovimentacaoService movimentacaoService;
    private final CatalogoMestreRepository catalogoMestreRepo;

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public PedidoPublicadorDTO.Response criarPedidoPublicador(
            PedidoPublicadorDTO.Request dto
    ) {
        if (dto.getQuantidade() == null || dto.getQuantidade() <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade do pedido deve ser maior que zero."
            );
        }

        boolean temPublicacao = dto.getPublicacaoId() != null;
        boolean temCatalogo = dto.getCatalogoMestreId() != null;

        if (temPublicacao == temCatalogo) {
            throw new IllegalArgumentException(
                    "Informe exatamente uma referência: publicacaoId ou catalogoMestreId."
            );
        }

        Publicador publicador = publicadorRepo.findById(dto.getPublicadorId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Publicador não encontrado."));

        Congregacao congregacao = congregacaoRepo.findById(dto.getCongregacaoId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Congregação não encontrada."));

        if (!publicador.getCongregacao().getId().equals(congregacao.getId())) {
            throw new IllegalArgumentException(
                    "O publicador não pertence à congregação informada."
            );
        }

        if (!Boolean.TRUE.equals(publicador.getAtivo())) {
            throw new IllegalStateException(
                    "Não é possível criar um pedido para um publicador inativo."
            );
        }

        Publicacao publicacao = null;
        CatalogoMestre catalogo = null;

        if (temPublicacao) {
            publicacao = publicacaoRepo.findById(dto.getPublicacaoId())
                    .orElseThrow(() ->
                            new EntityNotFoundException("Publicação não encontrada."));

            if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
                throw new IllegalStateException(
                        "Não é possível criar pedido para uma publicação inativa."
                );
            }
        } else {
            catalogo = catalogoMestreRepo.findById(dto.getCatalogoMestreId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Item do Catálogo Mestre não encontrado."
                            ));
        }

        PedidoPublicador pedido = PedidoPublicador.builder()
                .publicador(publicador)
                .publicacao(publicacao)
                .catalogoMestre(catalogo)
                .congregacao(congregacao)
                .quantidade(dto.getQuantidade())
                .dataSolicitacao(LocalDateTime.now())
                .status(StatusPedidoPublicador.PENDENTE)
                .observacoes(dto.getObservacoes())
                .build();

        return toPedidoPublicadorResponse(pedidoPublicadorRepo.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<PedidoPublicadorDTO.Response> listarPedidosPublicadores(Long congregacaoId, StatusPedidoPublicador status) {
        List<PedidoPublicador> lista = (status == null)
                ? pedidoPublicadorRepo.findByCongregacaoIdOrderByDataSolicitacaoDesc(congregacaoId)
                : pedidoPublicadorRepo.findByCongregacaoIdAndStatusOrderByDataSolicitacaoAsc(congregacaoId, status);

        return lista.stream().map(this::toPedidoPublicadorResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelarPedidoPublicador(Long id) {
        PedidoPublicador pedido = pedidoPublicadorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                		"Pedido de publicador não encontrado."
                ));
        
        if (pedido.getStatus() == StatusPedidoPublicador.CANCELADO) {
            throw new IllegalStateException(
                    "Este pedido já está cancelado."
            );
        }

        if (pedido.getStatus() == StatusPedidoPublicador.ATENDIDO) {
            throw new IllegalStateException(
                    "Não é possível cancelar um pedido já atendido."
            );
        }
        
        pedido.setStatus(StatusPedidoPublicador.CANCELADO);
        
        pedidoPublicadorRepo.save(pedido);
    }

    @Transactional
    public void marcarPedidoPublicadorAtendido(Long id) {
    	
        PedidoPublicador pedido = pedidoPublicadorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                		"Pedido de publicador não encontrado."
                ));
        
        StatusPedidoPublicador statusAtual = pedido.getStatus();
        
        if (statusAtual != StatusPedidoPublicador.PENDENTE
                && statusAtual != StatusPedidoPublicador.INCLUIDO_NO_PEDIDO) {
            throw new IllegalStateException(
                    "Somente pedidos pendentes ou incluídos em um pedido de Betel"
                    + "podem ser atendidos."
            );
        }
        
        Usuario responsavel = obterUsuarioLogado();
        
        if (responsavel == null) {
            throw new IllegalStateException(
                    "Usuário autenticado não encontrado."
            );
        }
        
        MovimentacaoEstoqueDTO movimentacaoDTO =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.SAIDA,
                        pedido.getQuantidade(),
                        pedido.getPublicador().getId(),
                        "Saída referente ao Pedido de Publicador ID: "
                                + pedido.getId()
                );

        movimentacaoService.movimentar(
                pedido.getPublicacao().getId(),
                pedido.getCongregacao().getId(),
                movimentacaoDTO,
                responsavel
        );
        
        pedido.setStatus(StatusPedidoPublicador.ATENDIDO);
        pedido.setDataAtendimento(LocalDateTime.now());
        pedidoPublicadorRepo.save(pedido);
    }


	@Transactional
	public PedidoBetelDTO.Response criarPedidoBetel(
	        PedidoBetelDTO.CriarRequest dto
	) {
	    if (dto == null) {
	        throw new IllegalArgumentException(
	                "Os dados do pedido de Betel são obrigatórios."
	        );
	    }
	
	    if (dto.getCongregacaoId() == null) {
	        throw new IllegalArgumentException(
	                "A congregação do pedido deve ser informada."
	        );
	    }
	
	    if (dto.getItens() == null || dto.getItens().isEmpty()) {
	        throw new IllegalArgumentException(
	                "O pedido de Betel deve possuir pelo menos um item."
	        );
	    }
	
	    Congregacao congregacao = congregacaoRepo
	            .findById(dto.getCongregacaoId())
	            .orElseThrow(() -> new EntityNotFoundException(
	                    "Congregação não encontrada."
	            ));
	
	    PedidoBetel pedidoBetel = PedidoBetel.builder()
	            .congregacao(congregacao)
	            .numeroPedido(dto.getNumeroPedido())
	            .mesAnoReferencia(dto.getMesAnoReferencia())
	            .dataCriacao(LocalDateTime.now())
	            .status(StatusPedidoBetel.RASCUNHO)
	            .observacoes(dto.getObservacoes())
	            .itens(new ArrayList<>())
	            .build();
	
	    for (PedidoBetelDTO.ItemRequest itemDto : dto.getItens()) {
	        pedidoBetel.getItens().add(
	                criarItemPedidoBetel(pedidoBetel, itemDto)
	        );
	    }
	
	    List<Long> pedidosIds = dto.getPedidosPublicadoresIds();
	
	    if (pedidosIds != null && !pedidosIds.isEmpty()) {
	        Set<Long> pedidosIdsUnicos = new HashSet<>(pedidosIds);
	
	        if (pedidosIdsUnicos.contains(null)
	                || pedidosIdsUnicos.size() != pedidosIds.size()) {
	            throw new IllegalArgumentException(
	                    "A lista de pedidos de publicadores contém IDs inválidos "
	                    + "ou repetidos."
	            );
	        }
	
	        List<PedidoPublicador> pedidosPublicadores =
	                pedidoPublicadorRepo.findAllById(pedidosIdsUnicos);
	
	        if (pedidosPublicadores.size() != pedidosIdsUnicos.size()) {
	            throw new EntityNotFoundException(
	                    "Um ou mais pedidos de publicador não foram encontrados."
	            );
	        }
	
	        for (PedidoPublicador pedido : pedidosPublicadores) {
	            if (!pedido.getCongregacao().getId()
	                    .equals(congregacao.getId())) {
	                throw new IllegalArgumentException(
	                        "O pedido de publicador ID " + pedido.getId()
	                        + " pertence a outra congregação."
	                );
	            }
	
	            if (pedido.getStatus() != StatusPedidoPublicador.PENDENTE) {
	                throw new IllegalStateException(
	                        "O pedido de publicador ID " + pedido.getId()
	                        + " não está pendente."
	                );
	            }
	
	            if (pedido.getPedidoBetel() != null) {
	                throw new IllegalStateException(
	                        "O pedido de publicador ID " + pedido.getId()
	                        + " já está vinculado a um pedido de Betel."
	                );
	            }
	        }
	    }
	
	    PedidoBetel salvo = pedidoBetelRepo.save(pedidoBetel);
	
	    if (pedidosIds != null && !pedidosIds.isEmpty()) {
	        List<PedidoPublicador> pedidosPublicadores =
	                pedidoPublicadorRepo.findAllById(pedidosIds);
	
	        for (PedidoPublicador pedido : pedidosPublicadores) {
	            pedido.setPedidoBetel(salvo);
	            pedido.setStatus(StatusPedidoPublicador.INCLUIDO_NO_PEDIDO);
	        }
	
	        pedidoPublicadorRepo.saveAll(pedidosPublicadores);
	    }
	
	    return toPedidoBetelResponse(salvo);
	}

    @Transactional(readOnly = true)
    public List<PedidoBetelDTO.Response> listarPedidosBetel(Long congregacaoId) {
        return pedidoBetelRepo.findByCongregacaoIdOrderByDataCriacaoDesc(congregacaoId)
                .stream()
                .map(this::toPedidoBetelResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoBetelDTO.Response buscarPedidoBetelPorId(Long id) {
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));
        return toPedidoBetelResponse(pedido);
    }

    @Transactional
    public PedidoBetelDTO.Response marcarComoEnviado(Long id) {
    	
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Pedido Betel não encontrado."
                ));

        if (pedido.getStatus() != StatusPedidoBetel.RASCUNHO) {
            throw new IllegalStateException(
                    "Somente pedidos em rascunho podem ser enviados."
            );
        }
        
        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            throw new IllegalStateException(
                    "Não é possível enviar um pedido Betel sem itens."
            );
        }

        pedido.setStatus(StatusPedidoBetel.ENVIADO);
        pedido.setDataEnvio(LocalDateTime.now());

        return toPedidoBetelResponse(
                pedidoBetelRepo.save(pedido)
        );
    }

    @Transactional
    public PedidoBetelDTO.Response registrarRecebimento(
            Long pedidoBetelId,
            PedidoBetelDTO.ConferirPedidoRequest dto
    ) {
        PedidoBetel pedido = pedidoBetelRepo.findById(pedidoBetelId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Pedido Betel não encontrado."
                ));

        Usuario responsavel = obterUsuarioLogado();

        if (responsavel == null) {
            throw new IllegalStateException(
                    "Usuário autenticado não encontrado."
            );
        }

        if (pedido.getStatus() == StatusPedidoBetel.CANCELADO) {
            throw new IllegalStateException(
                    "Não é possível receber um pedido cancelado."
            );
        }

        if (pedido.getStatus() == StatusPedidoBetel.RASCUNHO) {
            throw new IllegalStateException(
                    "O pedido precisa ser enviado antes do recebimento."
            );
        }

        if (pedido.getStatus() == StatusPedidoBetel.RECEBIDO_TOTAL) {
            throw new IllegalStateException(
            		"O pedido já foi recebido integralmente."
            );
        }

        if (dto == null
                || dto.getItensRecebidos() == null
                || dto.getItensRecebidos().size() != pedido.getItens().size()) {
            throw new IllegalArgumentException(
                    "É necessário informar o recebimento de todos os itens do pedido."
            );
        }
        
        Set<Long> idsRecebidos = dto.getItensRecebidos()
                .stream()
                .map(PedidoBetelDTO.ConferirItemRequest::getItemId)
                .collect(Collectors.toSet());

        if (idsRecebidos.contains(null)
                || idsRecebidos.size() != pedido.getItens().size()
                || pedido.getItens().stream()
                        .anyMatch(item -> !idsRecebidos.contains(item.getId()))) {
            throw new IllegalArgumentException(
                    "Cada item do pedido deve ser informado exatamente uma vez."
            );
        }
        
        boolean recebimentoTotal = true;

        for (PedidoBetelDTO.ConferirItemRequest conf
                : dto.getItensRecebidos()) {

            ItemPedidoBetel item = pedido.getItens()
                    .stream()
                    .filter(i -> i.getId().equals(conf.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Item ID "
                                    + conf.getItemId()
                                    + " não pertence ao pedido."
                    ));

            int quantidadeAnterior =
                    item.getQuantidadeRecebida() != null
                            ? item.getQuantidadeRecebida()
                            : 0;
            
            Integer quantidadeInformada = conf.getQuantidadeRecebida();
            
            if (quantidadeInformada == null) {
                throw new IllegalArgumentException(
                        "A quantidade recebida deve ser informada para o item "
                                + item.getId() + "."
                );
            }

            int quantidadeRecebida = quantidadeInformada;
            
            if (quantidadeRecebida < 0) {
                throw new IllegalArgumentException(
                        "A quantidade recebida não pode ser negativa."
                );
            }

            if (quantidadeRecebida < quantidadeAnterior) {
                throw new IllegalArgumentException(
                        "A quantidade recebida não pode ser menor que "
                                + "a quantidade já registrada para o item "
                                + item.getId() + "."
                );
            }

            if (quantidadeRecebida > item.getQuantidadeSolicitada()) {
                throw new IllegalArgumentException(
                        "A quantidade recebida não pode superar a quantidade "
                                + "solicitada para o item " + item.getId() + "."
                );
            }
            
            int quantidadeEntrada =
                    quantidadeRecebida - quantidadeAnterior;

            item.setQuantidadeRecebida(quantidadeRecebida);
            
            if (quantidadeRecebida < item.getQuantidadeSolicitada()) {
                recebimentoTotal = false;
            }


			if (quantidadeEntrada > 0) {
			    Publicacao publicacao = item.getPublicacao();
			    CatalogoMestre catalogo = item.getCatalogoMestre();
			
			    if (publicacao == null) {
			        if (catalogo == null) {
			            throw new IllegalStateException(
			                    "O item do pedido " + item.getId()
			                    + " não possui publicação nem referência ao catálogo."
			            );
			        }
			
			        publicacao = publicacaoRepo
			                .findByCodigoIgnoreCase(catalogo.getCodigo())
			                .orElseGet(() -> publicacaoRepo.saveAndFlush(
			                        Publicacao.builder()
			                                .codigo(catalogo.getCodigo())
			                                .titulo(catalogo.getTitulo())
			                                .categoria(catalogo.getCategoria())
			                                .formato(catalogo.getFormato())
			                                .idioma(catalogo.getIdioma())
			                                .ativo(true)
			                                .build()
			                ));
			
			        if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
			            throw new IllegalStateException(
			                    "A publicação de código " + catalogo.getCodigo()
			                    + " existe, mas está inativa. "
			                    + "Verifique seu cadastro antes de receber o pedido."
			            );
			        }
			
			        // Mantém a referência ao catálogo como origem do pedido.
			        item.setPublicacao(publicacao);
			    }
			
			    MovimentacaoEstoqueDTO movimentacaoDTO =
			            new MovimentacaoEstoqueDTO(
			                    TipoMovimentacao.ENTRADA,
			                    quantidadeEntrada,
			                    null,
			                    "Entrada via recebimento do Pedido Betel: "
			                            + (
			                                pedido.getNumeroPedido() != null
			                                        ? pedido.getNumeroPedido()
			                                        : pedido.getId()
			                            )
			            );
			
			    movimentacaoService.movimentar(
			            publicacao.getId(),
			            pedido.getCongregacao().getId(),
			            movimentacaoDTO,
			            responsavel
			    );
			}
        }
        
        if (recebimentoTotal) {
            pedido.setStatus(StatusPedidoBetel.RECEBIDO_TOTAL);
            pedido.setDataRecebimento(LocalDateTime.now());
        } else {
            pedido.setStatus(StatusPedidoBetel.RECEBIDO_PARCIAL);
            pedido.setDataRecebimento(null);
        }

        if (dto.getObservacoes() != null) {
            pedido.setObservacoes(dto.getObservacoes());
        }

        return toPedidoBetelResponse(
                pedidoBetelRepo.save(pedido)
        );
    }

    private Usuario obterUsuarioLogado() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof Usuario usuario) {
            return usuarioRepo.findById(usuario.getId())
                    .orElse(null);
        }

        String identificador = auth.getName();

        if (identificador == null
                || identificador.isBlank()
                || "anonymousUser".equals(identificador)) {
            return null;
        }

        return usuarioRepo.findByEmail(identificador)
                .orElse(null);
    }

	@Transactional
	public PedidoBetelDTO.Response atualizarPedidoBetel(
	        Long id,
	        PedidoBetelDTO.CriarRequest dto
	) {
	    if (dto == null) {
	        throw new IllegalArgumentException(
	                "Os dados do pedido de Betel são obrigatórios."
	        );
	    }
	
	    if (dto.getItens() == null || dto.getItens().isEmpty()) {
	        throw new IllegalArgumentException(
	                "O pedido de Betel deve possuir pelo menos um item."
	        );
	    }
	
	    PedidoBetel pedido = pedidoBetelRepo.findById(id)
	            .orElseThrow(() -> new EntityNotFoundException(
	                    "Pedido Betel não encontrado."
	            ));
	
	    if (pedido.getStatus() != StatusPedidoBetel.RASCUNHO) {
	        throw new IllegalStateException(
	                "Somente pedidos Betel em rascunho podem ser editados."
	        );
	    }
	
	    if (dto.getCongregacaoId() != null
	            && !dto.getCongregacaoId().equals(
	                    pedido.getCongregacao().getId())) {
	        throw new IllegalArgumentException(
	                "Não é permitido transferir o pedido para outra congregação."
	        );
	    }
	
	    pedido.setNumeroPedido(dto.getNumeroPedido());
	    pedido.setMesAnoReferencia(dto.getMesAnoReferencia());
	    pedido.setObservacoes(dto.getObservacoes());
	
	    pedido.getItens().clear();
	
	    for (PedidoBetelDTO.ItemRequest itemDto : dto.getItens()) {
	        pedido.getItens().add(
	                criarItemPedidoBetel(pedido, itemDto)
	        );
	    }
	
	    return toPedidoBetelResponse(pedidoBetelRepo.save(pedido));
	}

    @Transactional
    public void excluirPedidoBetel(Long id) {
    	
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                		"Pedido Betel não encontrado."
                ));

        if (pedido.getStatus() != StatusPedidoBetel.RASCUNHO) {
            throw new IllegalStateException(
                    "Somente pedidos Betel em rascunho podem ser excluídos."
            );
        }
        
        List<PedidoPublicador> vinculados = pedidoPublicadorRepo.findByPedidoBetelId(id);
        
        for (PedidoPublicador pp : vinculados) {
            pp.setPedidoBetel(null);
            if (pp.getStatus() == StatusPedidoPublicador.INCLUIDO_NO_PEDIDO) {
                pp.setStatus(StatusPedidoPublicador.PENDENTE);
            }
        }
        
        if (!vinculados.isEmpty()) {
            pedidoPublicadorRepo.saveAll(vinculados);
        }
        
       pedidoBetelRepo.delete(pedido);
    }
    
    private ItemPedidoBetel criarItemPedidoBetel(
	        PedidoBetel pedido,
	        PedidoBetelDTO.ItemRequest itemDto
	) {
	    if (itemDto == null) {
	        throw new IllegalArgumentException(
	                "Os dados do item do pedido são obrigatórios."
	        );
	    }
	
	    if (itemDto.getQuantidadeSolicitada() == null
	            || itemDto.getQuantidadeSolicitada() <= 0) {
	        throw new IllegalArgumentException(
	                "A quantidade solicitada deve ser maior que zero."
	        );
	    }
	
	    Long catalogoMestreId = itemDto.getCatalogoMestreId();
	    Long publicacaoId = itemDto.getPublicacaoId();
	
	    if ((catalogoMestreId == null) == (publicacaoId == null)) {
	        throw new IllegalArgumentException(
	                "Informe exatamente uma referência: "
	                + "catalogoMestreId ou publicacaoId."
	        );
	    }
	
	    CatalogoMestre catalogo = null;
	    Publicacao publicacao = null;
	    String codigo;
	
	    if (catalogoMestreId != null) {
	        catalogo = catalogoMestreRepo.findById(catalogoMestreId)
	                .orElseThrow(() -> new EntityNotFoundException(
	                        "Item do Catálogo Mestre ID "
	                                + catalogoMestreId
	                                + " não encontrado."
	                ));
	
	        codigo = catalogo.getCodigo();
	    } else {
	        publicacao = publicacaoRepo.findById(publicacaoId)
	                .orElseThrow(() -> new EntityNotFoundException(
	                        "Publicação ID " + publicacaoId
	                                + " não encontrada."
	                ));
	
	        if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
	            throw new IllegalStateException(
	                    "A publicação ID " + publicacao.getId()
	                            + " está inativa."
	            );
	        }
	
	        codigo = publicacao.getCodigo();
	    }
	
	    boolean duplicado = pedido.getItens().stream().anyMatch(itemExistente -> {
	        String codigoExistente = itemExistente.getCatalogoMestre() != null
	                ? itemExistente.getCatalogoMestre().getCodigo()
	                : itemExistente.getPublicacao() != null
	                        ? itemExistente.getPublicacao().getCodigo()
	                        : null;
	
	        return codigoExistente != null
	                && codigoExistente.equalsIgnoreCase(codigo);
	    });
	
	    if (duplicado) {
	        throw new IllegalArgumentException(
	                "A mesma publicação não pode aparecer mais de uma vez "
	                + "no pedido de Betel. Consolide as quantidades."
	        );
	    }
	
	    return ItemPedidoBetel.builder()
	            .pedidoBetel(pedido)
	            .catalogoMestre(catalogo)
	            .publicacao(publicacao)
	            .quantidadeSolicitada(itemDto.getQuantidadeSolicitada())
	            .quantidadeRecebida(0)
	            .origem(itemDto.getOrigem() != null
	                    ? itemDto.getOrigem()
	                    : OrigemItemPedido.ESTOQUE)
	            .build();
	}


	private PedidoPublicadorDTO.Response toPedidoPublicadorResponse(
	        PedidoPublicador entity
	) {
	    Publicacao publicacao = entity.getPublicacao();
	
	    CatalogoMestre catalogo = entity.getCatalogoMestre();
	
	    return PedidoPublicadorDTO.Response.builder()
	            .id(entity.getId())
	            .publicadorId(entity.getPublicador().getId())
	            .publicadorNome(entity.getPublicador().getPessoa().getNome())
	
	            .publicacaoId(
	                    publicacao != null ? publicacao.getId() : null
	            )
	            .catalogoMestreId(
	                    catalogo != null ? catalogo.getId() : null
	            )
	            .publicacaoCodigo(
	                    publicacao != null
	                            ? publicacao.getCodigo()
	                            : catalogo != null
	                                    ? catalogo.getCodigo()
	                                    : null
	            )
	            .publicacaoTitulo(
	                    publicacao != null
	                            ? publicacao.getTitulo()
	                            : catalogo != null
	                                    ? catalogo.getTitulo()
	                                    : null
	            )
	
	            .congregacaoId(entity.getCongregacao().getId())
	            .quantidade(entity.getQuantidade())
	            .dataSolicitacao(entity.getDataSolicitacao())
	            .dataAtendimento(entity.getDataAtendimento())
	            .status(entity.getStatus())
	            .observacoes(entity.getObservacoes())
	            .pedidoBetelId(
	                    entity.getPedidoBetel() != null
	                            ? entity.getPedidoBetel().getId()
	                            : null
	            )
	            .build();
	}

	private PedidoBetelDTO.Response toPedidoBetelResponse(
	        PedidoBetel entity
	) {
	    List<PedidoBetelDTO.ItemResponse> itens = entity.getItens()
	            .stream()
	            .map(item -> {
	                CatalogoMestre catalogo = item.getCatalogoMestre();
	                Publicacao publicacao = item.getPublicacao();
	
	                String codigo = catalogo != null
	                        ? catalogo.getCodigo()
	                        : publicacao != null
	                                ? publicacao.getCodigo()
	                                : null;
	
	                String titulo = catalogo != null
	                        ? catalogo.getTitulo()
	                        : publicacao != null
	                                ? publicacao.getTitulo()
	                                : null;
	
	                return PedidoBetelDTO.ItemResponse.builder()
	                        .id(item.getId())
	                        .publicacaoId(
	                                publicacao != null
	                                        ? publicacao.getId()
	                                        : null
	                        )
	                        .catalogoMestreId(
	                                catalogo != null
	                                        ? catalogo.getId()
	                                        : null
	                        )
	                        .publicacaoCodigo(codigo)
	                        .publicacaoTitulo(titulo)
	                        .quantidadeSolicitada(
	                                item.getQuantidadeSolicitada()
	                        )
	                        .quantidadeRecebida(
	                                item.getQuantidadeRecebida()
	                        )
	                        .origem(item.getOrigem())
	                        .build();
	            })
	            .collect(Collectors.toList());
	
	    return PedidoBetelDTO.Response.builder()
	            .id(entity.getId())
	            .congregacaoId(entity.getCongregacao().getId())
	            .congregacaoNome(entity.getCongregacao().getNome())
	            .numeroPedido(entity.getNumeroPedido())
	            .mesAnoReferencia(entity.getMesAnoReferencia())
	            .dataCriacao(entity.getDataCriacao())
	            .dataEnvio(entity.getDataEnvio())
	            .dataRecebimento(entity.getDataRecebimento())
	            .status(entity.getStatus())
	            .observacoes(entity.getObservacoes())
	            .totalItens(itens.size())
	            .itens(itens)
	            .build();
	}
}