# Arte & Pintura

Site estático de marketing da **Arte & Pintura**, empresa de pintura residencial e comercial em Petrolina/PE e Juazeiro/BA. O site existe para receber pedidos de orçamento. Não há área logada, catálogo nem pagamento.

- Domínio: https://arteepinturapetrolina.com.br (só o apex; sem `www`)
- CNPJ: `22.426.463/0001-52`
- Leads: formulário → [FormSubmit](https://formsubmit.co) → `clebertsfigueiredo@gmail.com`
- Repositório: https://github.com/clebsf/arte-e-pintura
- Imagem em produção: `clebertsfigueiredo/arte-e-pintura:1.3.3` (tag fixada em `docker-compose.yml`)

Quem for alterar o código lê [AGENTS.md](AGENTS.md). Produto, páginas, analytics, SEO e decisões estão em [PRODUCT.md](PRODUCT.md).

Esta documentação descreve o repositório em 2026-10-28 (último commit de código: `f3426f0`, 2026-10-07). O README de 2026-10-06 falava em GA4 comentado, tag Docker `1.1.0` e `ports: "80:80"`. Produção hoje usa GA4 ativo, a tag `1.3.3` e Traefik, sem porta publicada no host.

## Visão geral

HTML, CSS e JavaScript, sem bundler e sem backend. O site institucional (home, serviços, cidades, sobre, contato e obrigado) usa `css/styles.css`, no visual portado do Superdesign em 2026-10-07 (azul petróleo, terracota, logo a 64px, fonte Satoshi). As landing pages `/lp/natal/`, `/lp/fachada/` e `/lp/empresa/` são páginas de campanha com `noindex`: a primeira versão entrou em 2026-10-06 e, no mesmo dia, foi trocada pelo visual vindo do Magic Patterns (Tailwind pelo CDN, imagens em `images/lp/`).

Nginx entrega os arquivos num container. Em produção, o Traefik do VPS Hostinger termina o TLS e encaminha só o apex para esse container.

## Estrutura

```
.
├── index.html                 # Home + JSON-LD LocalBusiness
├── servicos.html
├── petrolina.html             # SEO local
├── juazeiro.html              # SEO local
├── sobre.html
├── contato.html
├── obrigado.html              # Depois do envio do formulário
├── lp/natal/                  # Campanha de interiores / Natal (noindex)
├── lp/fachada/                # Campanha de fachada (noindex)
├── lp/empresa/                # Campanha comercial (noindex)
├── css/styles.css             # Só o site institucional
├── js/main.js                 # Menu, máscara, envio do lead, evento GA4
├── js/analytics.js            # GA4 (ID público de medição)
├── images/                    # Logo, favicon, fotos das LPs
├── sitemap.xml                # Páginas institucionais; sem /lp/
├── robots.txt                 # Disallow: /lp/
├── google4f938fbd9b62d312.html  # Verificação do Search Console
├── nginx.conf
├── Dockerfile
├── docker-compose.yml         # Produção (Traefik). Não publica o HTML local.
├── AGENTS.md
└── PRODUCT.md
```

`css/lp.css` existiu na primeira versão das LPs e saiu no redesign. `.superdesign/resume.json` registra o port visual do site institucional; o `.dockerignore` deixa essa pasta de fora da imagem.

## Pré-requisitos

- Docker, para ver o site com o mesmo nginx da produção.
- Python 3, se bastar um servidor estático.
- Não há `package.json`, Node, npm nem passo de build de frontend.

## Rodar localmente

`docker compose up` na raiz **não** mostra as alterações locais. O compose puxa a imagem já publicada (`pull_policy: always`), não tem `build:`, não mapeia porta no host e espera o Traefik da VPS.

### Servidor estático

Na raiz do repositório:

```bash
python3 -m http.server 8080
```

Abra http://localhost:8080. As LPs carregam Tailwind, fontes e o gtag de CDNs, então precisam de rede. O formulário posta na API do FormSubmit: um envio de teste manda e-mail de verdade para a caixa de leads. Abrir o HTML via `file://` quebra caminhos e o envio.

### Container local (nginx de produção)

```bash
docker build -t arte-pintura:local .
docker rm -f arte-pintura 2>/dev/null || true
docker run -d --name arte-pintura -p 8080:80 arte-pintura:local
```

Abra http://localhost:8080. O healthcheck do Dockerfile chama `wget` em `http://127.0.0.1/`. Para parar: `docker rm -f arte-pintura`.

O `.dockerignore` exclui `*.md`, o Dockerfile, o compose, `.git` e `.superdesign`. A documentação não é servida pelo site.

## Build

Não há compilação de CSS ou JS. O artefato de release é a imagem:

```bash
docker build -t clebertsfigueiredo/arte-e-pintura:X.Y.Z .
```

Base: `nginx:1.27-alpine`, processo na porta 80. CSS, JS e imagens levam `Cache-Control` de 7 dias (`nginx.conf`).

A tag publicada no compose é `1.3.3`. As anteriores neste arquivo: `1.3.0` (redesign do site), `1.3.1` (GA4), `1.3.2` (arquivo do Search Console), `1.3.3` (evento `generate_lead`). A próxima publicação usa uma tag nova e atualiza `image:` no mesmo commit. Não há GitHub Actions.

## Deploy

Produção, como está em `docker-compose.yml`:

| Item | Valor no repositório |
|---|---|
| VPS | Hostinger `srv1496407` |
| Domínio | `arteepinturapetrolina.com.br` |
| DNS | Comentário no compose: A para `187.77.241.92` |
| `www` | Fora do router e do certificado |
| TLS | Traefik, `certresolver=letsencrypt`, só o apex |
| Imagem | `clebertsfigueiredo/arte-e-pintura:1.3.3` |
| Porta | `expose: "80"` (sem `ports:` no host) |
| Hub | https://hub.docker.com/r/clebertsfigueiredo/arte-e-pintura |

O push para o Docker Hub e o diretório do compose na VPS não estão no git (a confirmar). O fluxo que os commits descrevem:

1. Editar os arquivos estáticos.
2. Fazer o build e o push da imagem com uma tag nova.
3. Apontar `image:` em `docker-compose.yml` para essa tag e commitar.
4. Na VPS, `docker compose pull` e `docker compose up -d` no diretório desse arquivo.
5. Abrir `https://arteepinturapetrolina.com.br/` e conferir o cadeado no apex.

O `Host()` do Traefik lista só o apex. Em 2026-10-06, incluir `www` fez o ACME falhar (o `www` não tem DNS) e derrubou o HTTPS do site inteiro (commit `4da9daf`). O comentário no compose registra que o `www` fica de fora de propósito.

O push na branch `main` não publica o site. Sem imagem nova e sem pull na VPS, produção continua na tag anterior.

## Formulário de orçamento

`js/main.js` trata todo `form[data-lead-form]`. Exige nome, telefone com DDD (10 ou 11 dígitos, máscara brasileira), cidade e resumo, e envia JSON para `https://formsubmit.co/ajax/clebertsfigueiredo@gmail.com`. `FORMSPREE_ENDPOINT` no mesmo arquivo está vazio; uma URL ali passa a usar Formspree no lugar do FormSubmit.

No primeiro envio real, o FormSubmit manda um link de confirmação para essa caixa. Sem o clique, os pedidos não chegam. Se essa confirmação já foi feita: a confirmar.

Com resposta HTTP ok, o script dispara o evento GA4 `generate_lead` (se `window.gtag` existir) e só então redireciona. O callback espera no máximo 2 segundos. O site institucional usa `data-next="https://arteepinturapetrolina.com.br/obrigado.html"`. Cada LP usa `data-next="/obrigado.html"`, `data-campaign` (`natal`, `fachada` ou `empresa`) e um `data-subject` próprio. O site institucional não envia `campanha`.

O atributo `action` do formulário aponta para o FormSubmit sem AJAX. Com JavaScript, `preventDefault` impede esse POST. Sem JavaScript, o navegador envia o formulário do jeito tradicional. Se esse fallback é desejado: a confirmar.

## Analytics e busca

O GA4 está ligado. O ID público de medição é `G-XZC9BNB7TH`, em `js/analytics.js`, carregado em todas as páginas HTML, inclusive LPs e `obrigado.html`.

O Search Console usa o arquivo `google4f938fbd9b62d312.html` na raiz (verificação por arquivo HTML). Esse arquivo precisa continuar no deploy. Se a propriedade já foi verificada no painel e se o sitemap foi enviado: a confirmar.

Páginas, eventos e SEO estão em [PRODUCT.md](PRODUCT.md).

## Marca do site institucional

| Token | Hex |
|---|---|
| Azul petróleo / navy | `#1B3A4B` |
| Terracota | `#C45C26` |
| Terracota escuro | `#A34A1E` |
| Fundo | `#F7F5F2` |
| Texto | `#2C2C2C` |

Fonte do institucional: Satoshi, via Fontshare, em `css/styles.css`. Logo do header: `images/logo.jpg`, altura 64px. Favicon: `images/favicon.svg`. As LPs não usam `styles.css`; cada uma declara a própria fonte e os mesmos azul e terracota.

## O que não tem aqui

Backend, banco, telefone, WhatsApp e redes sociais publicados, suíte de testes e gerenciador de pacotes. O contato público é o formulário.
