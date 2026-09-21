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

    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public PedidoPublicadorDTO.Response criarPedidoPublicador(PedidoPublicadorDTO.Request dto) {    	

        if (dto.getQuantidade() == null || dto.getQuantidade() <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade do pedido deve ser maior que zero."
            );
        }
        
        Publicador publicador = publicadorRepo.findById(dto.getPublicadorId())
                .orElseThrow(() -> new EntityNotFoundException("Publicador não encontrado."));
        Publicacao publicacao = publicacaoRepo.findById(dto.getPublicacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Publicação não encontrada."));
        
        if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
            throw new IllegalStateException(
                    "Não é possível criar pedido para uma publicação inativa."
            );
        }
        
        Congregacao congregacao = congregacaoRepo.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

        PedidoPublicador pedido = PedidoPublicador.builder()
                .publicador(publicador)
                .publicacao(publicacao)
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
                .orElseThrow(() -> new EntityNotFoundException("Pedido de publicador não encontrado."));
        pedido.setStatus(StatusPedidoPublicador.CANCELADO);
        pedidoPublicadorRepo.save(pedido);
    }

    @Transactional
    public void marcarPedidoPublicadorAtendido(Long id) {
    	
        PedidoPublicador pedido = pedidoPublicadorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido de publicador não encontrado."));
        
        if (pedido.getStatus() != StatusPedidoPublicador.PENDENTE) {
            throw new IllegalStateException(
                    "Somente pedidos pendentes podem ser atendidos."
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
    public PedidoBetelDTO.Response criarPedidoBetel(PedidoBetelDTO.CriarRequest dto) {
    	
        Congregacao congregacao = congregacaoRepo.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

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
        	
        	 if (itemDto.getQuantidadeSolicitada() == null
                     || itemDto.getQuantidadeSolicitada() <= 0) {
                 throw new IllegalArgumentException(
                         "A quantidade solicitada deve ser maior que zero."
                 );
             }
        	 
            Publicacao publicacao = publicacaoRepo.findById(itemDto.getPublicacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Publicação ID " + itemDto.getPublicacaoId() + " não encontrada."));
            
            if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
                throw new IllegalStateException(
                        "A publicação ID "
                                + publicacao.getId()
                                + " está inativa."
                );
            }
            
            ItemPedidoBetel item = ItemPedidoBetel.builder()
                    .pedidoBetel(pedidoBetel)
                    .publicacao(publicacao)
                    .quantidadeSolicitada(itemDto.getQuantidadeSolicitada())
                    .quantidadeRecebida(0)
                    .origem(itemDto.getOrigem() != null ? itemDto.getOrigem() : OrigemItemPedido.ESTOQUE)
                    .build();

            pedidoBetel.getItens().add(item);
        }

        PedidoBetel salvo = pedidoBetelRepo.save(pedidoBetel);

        if (dto.getPedidosPublicadoresIds() != null && !dto.getPedidosPublicadoresIds().isEmpty()) {
        	
            List<PedidoPublicador> pedidosPub = pedidoPublicadorRepo.findAllById(dto.getPedidosPublicadoresIds());
            
            if (pedidosPub.size() != dto.getPedidosPublicadoresIds().size()) {
                throw new EntityNotFoundException(
                        "Um ou mais pedidos de publicador não foram encontrados."
                );
            }
            
            for (PedidoPublicador pp : pedidosPub) {
            	
            	if (!pp.getCongregacao().getId().equals(congregacao.getId())) {
                    throw new IllegalArgumentException(
                            "O pedido de publicador ID "
                                    + pp.getId()
                                    + " pertence a outra congregação."
                    );
                }
            	
            	if (pp.getStatus() != StatusPedidoPublicador.PENDENTE) {
                    throw new IllegalStateException(
                            "O pedido de publicador ID "
                                    + pp.getId()
                                    + " não está pendente."
                    );
                }
            	
                pp.setPedidoBetel(salvo);
                pp.setStatus(StatusPedidoPublicador.INCLUIDO_NO_PEDIDO);
            }
            
            pedidoPublicadorRepo.saveAll(pedidosPub);
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
                    "O pedido já foi recebido e encerrado."
            );
        }

        if (dto.getItensRecebidos().size() != pedido.getItens().size()) {
            throw new IllegalArgumentException(
                    "É necessário informar o recebimento de todos os itens do pedido."
            );
        }
        
        Set<Long> idsRecebidos = dto.getItensRecebidos()
                .stream()
                .map(PedidoBetelDTO.ConferirItemRequest::getItemId)
                .collect(Collectors.toSet());

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

            int quantidadeRecebida =
                    conf.getQuantidadeRecebida();

            if (quantidadeRecebida < quantidadeAnterior) {
                throw new IllegalArgumentException(
                        "A quantidade recebida não pode ser menor que "
                                + "a quantidade já registrada para o item "
                                + conf.getItemId()
                );
            }

            int quantidadeEntrada =
                    quantidadeRecebida - quantidadeAnterior;

            item.setQuantidadeRecebida(quantidadeRecebida);

            if (quantidadeEntrada > 0) {

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
                        item.getPublicacao().getId(),
                        pedido.getCongregacao().getId(),
                        movimentacaoDTO,
                        responsavel
                );
            }
        }

        pedido.setStatus(StatusPedidoBetel.RECEBIDO_TOTAL);
        pedido.setDataRecebimento(LocalDateTime.now());

        if (dto.getObservacoes() != null) {
            pedido.setObservacoes(dto.getObservacoes());
        }

        List<PedidoPublicador> pedidosPublicadores =
                pedidoPublicadorRepo.findByPedidoBetelId(pedidoBetelId);

        for (PedidoPublicador pp : pedidosPublicadores) {
            pp.setStatus(StatusPedidoPublicador.ATENDIDO);
            pp.setDataAtendimento(LocalDateTime.now());
        }

        if (!pedidosPublicadores.isEmpty()) {
            pedidoPublicadorRepo.saveAll(pedidosPublicadores);
        }

        return toPedidoBetelResponse(
                pedidoBetelRepo.save(pedido)
        );
    }

    private Usuario obterUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            return usuarioRepo.findByEmail(auth.getName())
                    .orElse(null);
        }
        return null;
    }
    
    @Transactional
    public PedidoBetelDTO.Response atualizarPedidoBetel(Long id, PedidoBetelDTO.CriarRequest dto) {
    	
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));

        if (pedido.getStatus() != StatusPedidoBetel.RASCUNHO) {
            throw new IllegalStateException(
                    "Somente pedidos Betel em rascunho podem ser editados."
            );
        }

        pedido.setNumeroPedido(dto.getNumeroPedido());
        pedido.setMesAnoReferencia(dto.getMesAnoReferencia());
        pedido.setObservacoes(dto.getObservacoes());
        
        pedido.getItens().clear();
        
        for (PedidoBetelDTO.ItemRequest itemDto : dto.getItens()) {
        	
        	if (itemDto.getQuantidadeSolicitada() == null
                    || itemDto.getQuantidadeSolicitada() <= 0) {
                throw new IllegalArgumentException(
                        "A quantidade solicitada deve ser maior que zero."
                );
            }
        	
            Publicacao publicacao = publicacaoRepo.findById(itemDto.getPublicacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Publicação ID " + itemDto.getPublicacaoId() + " não encontrada."));
            
            if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
                throw new IllegalStateException(
                        "A publicação ID "
                                + publicacao.getId()
                                + " está inativa."
                );
            }
            
            ItemPedidoBetel item = ItemPedidoBetel.builder()
                    .pedidoBetel(pedido)
                    .publicacao(publicacao)
                    .quantidadeSolicitada(itemDto.getQuantidadeSolicitada())
                    .quantidadeRecebida(0)
                    .origem(itemDto.getOrigem() != null ? itemDto.getOrigem() : OrigemItemPedido.ESTOQUE)
                    .build();

            pedido.getItens().add(item);
        }

        return toPedidoBetelResponse(pedidoBetelRepo.save(pedido));
    }

    @Transactional
    public void excluirPedidoBetel(Long id) {
    	
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));

        if (pedido.getStatus() != StatusPedidoBetel.RASCUNHO) {
            throw new IllegalStateException(
                    "Somente pedidos Betel em rascunho podem ser excluídos."
            );
        }
        
        List<PedidoPublicador> vinculados = pedidoPublicadorRepo.findByPedidoBetelId(id);
        
        for (PedidoPublicador pp : vinculados) {
            pp.setPedidoBetel(null);
            pp.setStatus(StatusPedidoPublicador.PENDENTE);
        }
        
        if (!vinculados.isEmpty()) {
            pedidoPublicadorRepo.saveAll(vinculados);
        }
        
       pedidoBetelRepo.delete(pedido);
    }

    private PedidoPublicadorDTO.Response toPedidoPublicadorResponse(PedidoPublicador entity) {
        return PedidoPublicadorDTO.Response.builder()
                .id(entity.getId())
                .publicadorId(entity.getPublicador().getId())
                .publicadorNome(entity.getPublicador().getPessoa().getNome())
                .publicacaoId(entity.getPublicacao().getId())
                .publicacaoCodigo(entity.getPublicacao().getCodigo())
                .publicacaoTitulo(entity.getPublicacao().getTitulo())
                .congregacaoId(entity.getCongregacao().getId())
                .quantidade(entity.getQuantidade())
                .dataSolicitacao(entity.getDataSolicitacao())
                .dataAtendimento(entity.getDataAtendimento())
                .status(entity.getStatus())
                .observacoes(entity.getObservacoes())
                .pedidoBetelId(entity.getPedidoBetel() != null ? entity.getPedidoBetel().getId() : null)
                .build();
    }

    private PedidoBetelDTO.Response toPedidoBetelResponse(PedidoBetel entity) {
        List<PedidoBetelDTO.ItemResponse> itens = entity.getItens().stream()
                .map(i -> PedidoBetelDTO.ItemResponse.builder()
                        .id(i.getId())
                        .publicacaoId(i.getPublicacao().getId())
                        .publicacaoCodigo(i.getPublicacao().getCodigo())
                        .publicacaoTitulo(i.getPublicacao().getTitulo())
                        .quantidadeSolicitada(i.getQuantidadeSolicitada())
                        .quantidadeRecebida(i.getQuantidadeRecebida())
                        .origem(i.getOrigem())
                        .build())
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