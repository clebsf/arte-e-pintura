# AGENTS.md — Arte & Pintura

Instruções para agentes e bots que alteram este repositório. Produto, público e decisões de negócio: [PRODUCT.md](PRODUCT.md). Visão geral, setup e deploy: [README.md](README.md).

Estado descrito em 2026-10-28, código até `f3426f0` (2026-10-07). O que o git não permite afirmar está marcado com **a confirmar**.

## O que é este repositório

Site estático (HTML, CSS, JS) da Arte & Pintura. Nginx em Docker. Produção no VPS Hostinger `srv1496407`, atrás do Traefik, domínio `arteepinturapetrolina.com.br`. Sem framework, sem `package.json`, sem testes automatizados, sem CI.

Leia o arquivo antes de editar. Header, footer e formulário estão copiados em cada HTML. Uma mudança de navegação no institucional passa por todas as páginas da lista abaixo, não por um layout compartilhado.

## Mapa rápido

| Caminho | Papel |
|---|---|
| `index.html`, `servicos.html`, `petrolina.html`, `juazeiro.html`, `sobre.html`, `contato.html`, `obrigado.html` | Site institucional. `css/styles.css` + `js/main.js?v=2` + `js/analytics.js`. |
| `lp/natal/`, `lp/fachada/`, `lp/empresa/` | Campanhas. Tailwind CDN, `js/main.js?v=4`, `js/analytics.js`. `noindex`. |
| `js/main.js` | Menu mobile, máscara de telefone, POST do lead, evento `generate_lead`. |
| `js/analytics.js` | Único lugar do ID de medição GA4. |
| `nginx.conf` | `try_files`, headers, cache de 7 dias para CSS/JS/imagens. |
| `Dockerfile` | Define a imagem (`nginx:1.27-alpine`). A VPS não builda este arquivo; ela puxa a tag do compose. |
| `docker-compose.yml` | Produção: imagem publicada + labels Traefik. Não faz build local. |
| `google4f938fbd9b62d312.html` | Verificação do Search Console. Não apagar. |
| `sitemap.xml`, `robots.txt` | SEO do institucional. `/lp/` fica de fora. |
| `.superdesign/resume.json` | Rastro do port Superdesign. Não entra na imagem. |

## Rodar

Não use `docker compose up` para ver HTML local. Esse compose puxa `clebertsfigueiredo/arte-e-pintura:1.3.3`, não monta o diretório e não publica porta.

Pré-visualização:

```bash
python3 -m http.server 8080
```

Nginx igual ao da imagem:

```bash
docker build -t arte-pintura:local .
docker rm -f arte-pintura 2>/dev/null || true
docker run -d --name arte-pintura -p 8080:80 arte-pintura:local
```

Abra http://localhost:8080, http://localhost:8080/lp/natal/, `/lp/fachada/` e `/lp/empresa/`. As LPs precisam de rede (CDN do Tailwind, Google Fonts, gtag).

Não abra os HTML por `file://`. Não envie o formulário como “teste rápido”: o POST vai para a caixa real `clebertsfigueiredo@gmail.com`.

## Testar

Não há `npm test`, lint, nem workflow. A checagem é manual.

Depois de mexer em página institucional:

- Home, serviços, Petrolina, Juazeiro, sobre, contato e obrigado abrem sem 404.
- No largo da janela o menu cabe; abaixo de 900px o botão “Menu” abre e fecha (`aria-expanded`).
- Logo do header continua com 64px de altura (`css/styles.css`, `.logo-link img`).
- Formulário em home, Petrolina, Juazeiro e contato: campos vazios e telefone curto mostram erro e não navegam. Telefone aceito: 10 ou 11 dígitos.
- Juazeiro deixa `Juazeiro/BA` selecionado. As outras páginas deixam `Petrolina/PE`.

Depois de mexer numa LP:

- `meta robots` continua `noindex,nofollow`.
- O header da LP é só a marca e o link “Site” para `/`. Sem o menu institucional.
- O formulário tem `data-lead-form`, `data-campaign` (`natal`, `fachada` ou `empresa`), `data-subject` e `data-next="/obrigado.html"`.
- A LP Natal: o FAQ abre e fecha (script no final de `lp/natal/index.html`).

Depois de mexer em `js/main.js` ou `js/analytics.js`:

- Suba o `?v=` em **todos** os `<script src>` que apontam para o arquivo. Hoje o institucional usa `js/main.js?v=2` e as LPs usam `../../js/main.js?v=4`. São caches diferentes.
- `js/analytics.js` **não** tem query string. O nginx guarda JS por 7 dias. Se alterar esse arquivo, acrescente `?v=` em todas as páginas no mesmo commit. Sem isso, produção fica até uma semana no script antigo.
- `css/styles.css?v=4` no institucional: suba o número junto com mudança de CSS.

Depois de mexer em SEO:

- URL nova do institucional entra em `sitemap.xml` com `https://arteepinturapetrolina.com.br/...`.
- LP nova **não** entra no sitemap e ganha `Disallow` coerente com `robots.txt` (hoje `Disallow: /lp/`).
- Canonical e `og:url` do institucional usam o apex, sem `www`.

Não há página 404 própria: o nginx devolve a 404 padrão.

Conferir o container:

```bash
docker build -t arte-pintura:local .
docker run --rm -d --name arte-pintura-test -p 8080:80 arte-pintura:local
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/lp/natal/
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/sitemap.xml
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/google4f938fbd9b62d312.html
docker rm -f arte-pintura-test
```

O healthcheck da imagem (`wget` em `/`) só passa se a home responder.

## Build

```bash
docker build -t clebertsfigueiredo/arte-e-pintura:X.Y.Z .
```

Troque `X.Y.Z` por uma tag ainda não usada. A tag viva no compose é `1.3.3`. Não reutilize `latest` como único identificador: o compose fixa a tag numérica de propósito.

O `.dockerignore` tira `*.md` da imagem. `AGENTS.md` e `PRODUCT.md` não aparecem no site. Não copie documentação para dentro de `html` no Dockerfile.

Credenciais do Docker Hub não ficam no repositório. Não as coloque em commit, em `docker-compose.yml` nem em argumento de linha de comando que vá para o log. Onde essas credenciais estão: **a confirmar**.

## Deploy

A VPS não builda este git. Ela puxa a imagem citada em `docker-compose.yml`.

1. Build e push de `clebertsfigueiredo/arte-e-pintura:X.Y.Z`.
2. Atualizar `image:` para essa tag (mantenha `pull_policy: always`, `expose: "80"` e os labels Traefik).
3. Commitar a tag junto com o HTML que ela contém. Um commit de conteúdo sem tag nova não chega na VPS.
4. Na VPS `srv1496407`, no diretório do compose: `docker compose pull` e `docker compose up -d`. O caminho desse diretório no servidor: **a confirmar**.
5. Abrir https://arteepinturapetrolina.com.br/ e uma LP. O certificado é o do apex.

Labels que precisam permanecer:

- `traefik.http.routers.artepintura.rule=Host(\`arteepinturapetrolina.com.br\`)`
- `entrypoints=websecure`
- `tls.certresolver=letsencrypt`
- `loadbalancer.server.port=80`

O comentário no compose cita o A `187.77.241.92`. Isso é anotação, não uma consulta DNS. Se o IP da VPS mudou: **a confirmar** no DNS ao vivo antes de documentar outro número.

Não há Actions, webhook de deploy nem rollback automatizado. Rollback é apontar `image:` para uma tag anterior que ainda exista no Hub e repetir o pull. Quais tags antigas o Hub ainda guarda: **a confirmar**.

## Convenções

- Idioma da interface e dos textos novos: pt-BR. Frases curtas, como em `sobre.html`. Sem jargão de obra.
- `lang="pt-BR"` em todo HTML novo.
- Institucional: variáveis em `:root` de `css/styles.css` (`--blue` / `--navy` `#1B3A4B`, `--terracotta` `#C45C26`, `--bg` `#F7F5F2`, `--charcoal` `#2C2C2C`). Ícones são SVG inline. Fonte Satoshi (Fontshare), com fallback de sistema.
- Logo oficial do institucional: `images/logo.jpg`. Não trocar por wordmark desenhado em CSS. Altura no header: 64px.
- LPs: cada página é autossuficiente (config do Tailwind, fontes Google e CSS no próprio `<head>`). Não ligar `css/styles.css` nelas. Não unificar o visual das três campanhas.
- Formulário de lead: `data-lead-form` e os nomes `nome`, `telefone`, `cidade`, `resumo`. Cidade só `Petrolina/PE` ou `Juazeiro/BA`.
- LP: preencher também `data-subject`, `data-campaign` (slug estável) e `data-next`. O evento `generate_lead` manda `method: "form"`, `city` e, se houver, `campaign`.
- E-mail de destino: constante `LEAD_EMAIL` em `js/main.js`. O `action` visível do `<form>` usa o mesmo endereço. Os dois mudam juntos.
- Links internos do institucional são relativos (`contato.html`). Canonical, Open Graph e `data-next` do institucional usam `https://arteepinturapetrolina.com.br/...`.
- JSON-LD `LocalBusiness` existe só em `index.html`. Outra página com dado estruturado precisa de motivo.
- Comentários de código existentes estão em inglês ou pt-BR. Combine com o arquivo que estiver editando.
- Commits deste repositório usam convencional em inglês (`feat:`, `fix:`, `chore:`, `docs:`).

## O que não fazer

- Não colocar telefone, WhatsApp, Instagram ou endereço de rua no site. O texto público diz que o contato é o formulário. Mudar isso é decisão de produto, não um “ajuste de rodapé”.
- Não indexar LP. Sem `noindex,nofollow`, sem entrada no sitemap, e `/lp/` continua no `Disallow` do `robots.txt`.
- Não recolocar `www` no `Host()` do Traefik, no canonical ou no sitemap. O `www` não tem DNS; o certificado Let's Encrypt falhou quando o SAN incluía `www` (`4da9daf`).
- Não trocar o compose para `build:` local na VPS sem pedido explícito. Produção puxa imagem do Docker Hub.
- Não publicar porta 80 do container no host se o Traefik já é a entrada. O compose usa `expose`, não `ports`.
- Não apagar `google4f938fbd9b62d312.html` nem mudar o ID `G-XZC9BNB7TH` em `js/analytics.js` sem pedido. Não criar segundo snippet gtag no `<head>`. Não commitar propriedade do GA4, token de API, senha do Hub ou arquivo `.env`.
- Não documentar segredo. ID de medição e o nome do arquivo de verificação do Search Console já são públicos (estão no HTML servido). Para por aí.
- Não “corrigir” o redirect das LPs para a URL absoluta da home, nem o inverso, sem testar os dois. Institucional: URL absoluta de `obrigado.html`. LPs: caminho `/obrigado.html`.
- Não remover `event_callback` / `event_timeout` do `generate_lead`. Sem o callback, o redirect pode ocorrer antes do hit.
- Não adicionar bundler, Tailwind de build ou framework no institucional para “modernizar”. As LPs já dependem do CDN de propósito; o institucional é CSS próprio.
- Não editar `.superdesign/resume.json` num ajuste de copy. Esse arquivo descreve o port de 2026-10-07 e marca as LPs como fora de escopo.
- Não assumir que `docker compose up --build` reflete a documentação antiga. O compose atual não tem `build`.
- Não commitar envio de teste que grave outro destinatário “temporário” em `LEAD_EMAIL`.

## Formulário e analytics (contrato)

`js/analytics.js` cria `dataLayer`, define `gtag`, chama `gtag('config', 'G-XZC9BNB7TH')` e injeta `https://www.googletagmanager.com/gtag/js?id=G-XZC9BNB7TH`. Todas as páginas incluem o script com `defer`.

`js/main.js`, no sucesso do `fetch`:

- evento `generate_lead`;
- parâmetros `method` (`form`), `city` (valor do campo), `campaign` só se `data-campaign` existir;
- `event_callback` redireciona para `data-next`;
- `event_timeout`: 2000.
- Sem `gtag`, o redirect acontece mesmo assim.

Se o GA4 trata `generate_lead` como evento principal: **a confirmar** (isso é configuração no admin do Google, não neste repo).

`FORMSPREE_ENDPOINT` vazio mantém o FormSubmit. Preencher essa string troca o endpoint de todas as páginas. O primeiro envio FormSubmit exige confirmação na caixa; se a caixa já confirmou: **a confirmar**.

## Documentação

Mudou comportamento, página, tag de imagem, analytics ou SEO? Atualize [README.md](README.md), este arquivo e [PRODUCT.md](PRODUCT.md) no mesmo PR. Não deixe os três descrevendo tags ou fluxos diferentes.

## Itens a confirmar

- Caminho do `docker-compose.yml` na VPS e quem faz o pull.
- Onde estão as credenciais do Docker Hub e quais tags antigas ainda existem.
- Se o A `187.77.241.92` ainda é o da VPS.
- Se a caixa FormSubmit já confirmou o destinatário.
- Se a propriedade Search Console está verificada e se `sitemap.xml` foi enviado no painel.
- Se `generate_lead` é evento principal no GA4.
- Se o POST sem JavaScript (atributo `action`) deve continuar.
