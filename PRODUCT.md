# PRODUCT.md — Arte & Pintura

Contexto de produto para quem escreve página, campanha ou medição. Como rodar e o que não mudar no código: [AGENTS.md](AGENTS.md). Setup e deploy: [README.md](README.md).

Descrito a partir do repositório em 2026-10-28 (código até `f3426f0`, 2026-10-07). Frase marcada com **a confirmar** não está decidida no git.

## O que é

A Arte & Pintura é uma empresa de pintura de Petrolina/PE. O site https://arteepinturapetrolina.com.br apresenta o serviço e pede orçamento. Não vende tinta, não mostra preço fechado e não agenda sozinho: a pessoa descreve o serviço, deixa o telefone, e o retorno é por telefone.

CNPJ publicado no site: `22.426.463/0001-52`. Sede declarada no JSON-LD da home: Petrolina, PE, Brasil. Logradouro, CEP, telefone e horário de funcionamento não aparecem.

Quem o site coloca no comando da obra: **Adriano Medeiros** (`sobre.html` e a página de Petrolina). Os pedidos caem em `clebertsfigueiredo@gmail.com`. A relação entre essas duas pessoas, e quem responde o lead no dia a dia: **a confirmar**.

## Para quem

Moradores e negócios de Petrolina/PE e Juazeiro/BA que precisam pintar residência, loja, escritório, galpão, fachada ou interior. A base da equipe é Petrolina; Juazeiro é atendimento a partir dessa base (`juazeiro.html`).

A LP Empresa fala com quem decide pintura comercial (loja, escritório, galpão). A LP Fachada fala com quem vê desgaste de sol na fachada, residencial ou comercial. A LP Natal fala com quem quer interior pronto para visitas de fim de ano.

Fora dessas duas cidades o formulário não oferece opção. Ampliar a área de atendimento: **a confirmar**.

## Promessa que o site faz

Texto comum: acabamento limpo, prazo combinado, orçamento sem compromisso.

A home ainda afirma:

- retorno em geral em até 2 horas úteis;
- visita técnica e orçamento gratuitos na área urbana;
- proteção de pisos e móveis;
- contato só pelo formulário, sem spam.

A LP Empresa afirma resposta em até 1 dia útil, nota fiscal e prazo por escrito. Se a operação cumpre esses prazos e emite nota: **a confirmar**. Não invente um SLA novo na página.

## Páginas

### Site institucional (indexável)

Visual único desde o port Superdesign de 2026-10-07: fundo `#F7F5F2`, azul `#1B3A4B`, terracota `#C45C26`, fonte Satoshi, logo `images/logo.jpg` a 64px, ícones SVG. Menu: Início, Serviços, Petrolina, Juazeiro, Sobre, Contato, mais o botão “Solicitar orçamento”.

| URL | Função |
|---|---|
| `/` | Home. Hero, quatro serviços, três passos (orçamento, execução, prazo), formulário. Única página com JSON-LD `LocalBusiness`. |
| `/servicos.html` | Residências, empresas, fachadas e interiores, com CTA para contato. |
| `/petrolina.html` | SEO local. Lista de serviços, Adriano Medeiros, formulário com Petrolina selecionada. |
| `/juazeiro.html` | SEO local. Mesma oferta, deslocamento a partir de Petrolina, Juazeiro selecionada. |
| `/sobre.html` | Origem em Petrolina, Adriano no comando da obra, CNPJ, CTA. |
| `/contato.html` | Formulário como conteúdo principal. |
| `/obrigado.html` | “Pedido enviado”. Pede para esperar o telefone. Está no sitemap (prioridade 0,2) e não tem `noindex`. |

Canonical, `og:url` e sitemap usam o apex. `og:image` do institucional é o logo. `theme-color` é `#1B3A4B`.

### Landing pages (campanha, fora do índice)

Entraram em 2026-10-06 e, no mesmo dia, ganharam o visual do Magic Patterns. Ficam no caminho do apex (`/lp/...`), sem subdomínio. `robots.txt` tem `Disallow: /lp/`. Cada página tem `noindex,nofollow`. Não estão no sitemap. Header mínimo: marca da campanha e link “Site” para a home. Sem o menu institucional.

| URL | Campanha | `data-campaign` | Assunto do e-mail |
|---|---|---|---|
| `/lp/natal/` | Interiores até o Natal. Fontes Fraunces e Manrope. Fotos em `images/lp/natal/`. FAQ no próprio HTML. | `natal` | Lead LP Natal — Arte & Pintura |
| `/lp/fachada/` | Fachada e sol do sertão. Fontes Archivo e Inter. Fotos em `images/lp/fachada/`. | `fachada` | Lead LP Fachada — Arte & Pintura |
| `/lp/empresa/` | Lojas, escritórios e galpões. Fontes Inter Tight e JetBrains Mono. Fotos em `images/lp/empresa/`. | `empresa` | Lead LP Empresa — Arte & Pintura |

As três carregam Tailwind de `https://cdn.tailwindcss.com` e fontes do Google. `og:image` de cada uma é a foto principal da campanha. Origem e licença dessas fotos: **a confirmar**.

A LP Natal é sazonal (prazo “alinhado ao calendário de dezembro”). Data para tirá-la do ar ou substituir a campanha: **a confirmar**. Enquanto existir, continua `noindex`.

### Formulário (todas as páginas com pedido)

Campos: nome, telefone com DDD, cidade (Petrolina/PE ou Juazeiro/BA), resumo. Envio por AJAX ao FormSubmit, destino `clebertsfigueiredo@gmail.com`. Não há campo de e-mail do visitante. A home diz que o retorno pode ser ligação ou e-mail; o corpo das páginas de contato e de obrigado fala em telefone.

Sucesso leva a `obrigado.html` e, com GA4 carregado, registra `generate_lead` antes do redirect. Detalhe do contrato do script: [AGENTS.md](AGENTS.md).

Não há WhatsApp, telefone clicável nem rede social. Isso é escolha do site (“Não publicamos WhatsApp nem redes neste site”), não um esquecimento.

## Analytics

GA4 ligado em 2026-10-07 em todas as páginas HTML, inclusive LPs e obrigado.

- ID público de medição: `G-XZC9BNB7TH`
- Implementação: `js/analytics.js` carrega o gtag.js do GA4 e chama `gtag('config', ...)`. Não há container GTM (`GTM-…`) nem outro pixel no repositório.
- Conversão no código: evento `generate_lead` só depois do POST ok. Parâmetros: `method=form`, `city` com o valor escolhido, `campaign` nas LPs (`natal`, `fachada`, `empresa`). O institucional não manda `campaign`.
- O redirect espera o callback do evento por até 2 segundos.

Não está no repositório, e portanto **a confirmar**:

- se `generate_lead` foi marcado como evento principal no admin do GA4;
- filtros de domínio, retenção e vínculos com o Search Console;
- se existe conta de anúncios usando essas LPs.

Não grave neste arquivo propriedade secreta, segredo de API nem JSON de conta de serviço. O ID de medição já é público.

## SEO e Search Console

- `robots.txt` libera o site, bloqueia `/lp/` e aponta o sitemap `https://arteepinturapetrolina.com.br/sitemap.xml`.
- O sitemap lista `/`, `servicos.html`, `petrolina.html`, `juazeiro.html`, `sobre.html`, `contato.html` e `obrigado.html`.
- Título e description próprios em cada página institucional. A home descreve pintura residencial e comercial nas duas cidades.
- JSON-LD só na home: `LocalBusiness`, CNPJ em `taxID`, área atendida Petrolina/PE e Juazeiro/BA, ofertas de pintura residencial, comercial, fachadas e interiores, `priceRange` `$$`.
- Verificação do Search Console por arquivo HTML na raiz: `google4f938fbd9b62d312.html` (commit `3acba91`, imagem `1.3.2`). O arquivo precisa ir em todo deploy.
- Sem `www` no canonical, no sitemap e no certificado.

**A confirmar:** se o Google já aceitou a verificação e se alguém enviou o sitemap no Search Console. O repositório só prova que o arquivo e o sitemap existem.

Não há `hreflang` (só pt-BR). Não há blog. A 404 é a padrão do nginx.

## Decisões já tomadas

Registradas no código e nos commits. Não reabrir sem pedido.

1. **Site estático.** Sem backend próprio. Lead via FormSubmit. Formspree fica desligado (`FORMSPREE_ENDPOINT` vazio) até alguém preencher de propósito.
2. **Contato só pelo formulário.** Sem WhatsApp, telefone ou redes na interface.
3. **Duas cidades.** Petrolina e Juazeiro, nada mais no select.
4. **Dois visuais.** Institucional em CSS próprio (Superdesign, logo 64px). LPs separadas, cada uma com Tailwind CDN e tipografia própria (Magic Patterns). O port Superdesign deixou as LPs de fora (`.superdesign/resume.json`).
5. **LPs fora do Google.** `noindex,nofollow` + `Disallow: /lp/` + ausência no sitemap. Campanha não compete com a página de serviço.
6. **Apex apenas.** DNS e TLS sem `www`. Incluir `www` no Traefik quebrou o HTTPS em 2026-10-06.
7. **Deploy por imagem pinada.** Docker Hub `clebertsfigueiredo/arte-e-pintura`, tag no compose (`1.3.3` desde o evento de lead). Traefik no VPS `srv1496407`, Let's Encrypt, container sem porta publicada no host.
8. **GA4 com evento de lead.** Medição `G-XZC9BNB7TH` e `generate_lead` com cidade e campanha, antes de ir para obrigado.
9. **Search Console por arquivo HTML** na raiz, com o nome já publicado.
10. **Cache longo de estático** (7 dias) e quebra de cache por `?v=` no CSS e no `main.js`.

## Roadmap

Não há roadmap escrito no repositório. A lista abaixo são lacunas observadas em 2026-10-28. Não são compromissos e não devem ser implementadas “porque o PRODUCT pediu”.

- **A confirmar** se a LP Natal sai do ar depois de dezembro de 2026, ou se vira campanha permanente com outro texto.
- **A confirmar** direitos de uso das fotos em `images/lp/`.
- **A confirmar** se `generate_lead` vira evento principal no GA4 e se o sitemap já foi enviado ao Search Console.
- **A confirmar** se a confirmação única do FormSubmit na caixa de leads já foi feita.
- **A confirmar** endereço, telefone e horário, se um dia forem publicados. Hoje a decisão é não publicar.
- Não há CI, teste automatizado nem página 404 da marca.
- `js/analytics.js` não tem `?v=`. `main.js` está em `?v=2` no institucional e `?v=4` nas LPs.
- JSON-LD existe só na home. Petrolina e Juazeiro não repetem `LocalBusiness`.
- Tailwind, Fontshare, Google Fonts e gtag dependem de CDN externo.
- O POST do formulário sem JavaScript segue o `action` clássico do FormSubmit. Se isso deve permanecer: **a confirmar**.
