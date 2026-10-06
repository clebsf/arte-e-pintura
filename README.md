# Arte & Pintura — site institucional

Site estático de marketing para **Arte & Pintura** (pintura residencial e comercial em Petrolina/PE e Juazeiro/BA).

- Domínio: `arteepinturapetrolina.com.br`
- CNPJ: `22.426.463/0001-52`
- Leads por formulário → e-mail `clebertsfigueiredo@gmail.com`

## Estrutura

```
arte-pintura/
├── index.html          # Home
├── servicos.html
├── petrolina.html      # SEO local
├── juazeiro.html       # SEO local
├── sobre.html
├── contato.html
├── obrigado.html
├── css/styles.css
├── js/main.js
├── images/logo.jpg     # Logo oficial (opção A)
├── images/favicon.svg
├── sitemap.xml
├── robots.txt
├── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

## Rodar com Docker

Requisitos: Docker (Compose opcional).

### Com Docker Compose

```bash
cd arte-pintura
docker compose up -d --build
# se o plugin compose não existir:
# docker-compose up -d --build
```

### Sem Compose (build + run)

```bash
cd arte-pintura
docker build -t arte-pintura:latest .
docker rm -f arte-pintura 2>/dev/null
docker run -d --name arte-pintura -p 8080:80 --restart unless-stopped arte-pintura:latest
```

Abra: [http://localhost:8080](http://localhost:8080)

Parar:

```bash
docker compose down
# ou:
docker rm -f arte-pintura
```

### Hostinger (Docker / VPS)

1. Envie a pasta `arte-pintura` para o servidor (Git, SFTP ou painel).
2. No cluster/container, faça o build e suba o serviço (`docker compose up -d --build`).
3. Exponha a porta **80** do container (no compose local usamos `8080:80`; em produção mapeie `80:80` ou use o proxy do Hostinger).
4. No painel de DNS / Domínios da Hostinger, aponte `arteepinturapetrolina.com.br` (e `www`, se quiser) para o IP ou app Docker.
5. Ative HTTPS (Let’s Encrypt / SSL do painel).

Exemplo de porta em produção no `docker-compose.yml`:

```yaml
ports:
  - "80:80"
```

## Formulário de orçamento (e-mail)

Por padrão o site envia o lead via [FormSubmit](https://formsubmit.co) para `clebertsfigueiredo@gmail.com` (sem backend) e redireciona para `obrigado.html`.

**Importante:** no **primeiro** envio real, o FormSubmit manda um e-mail de confirmação para essa caixa. Abra e confirme o link uma vez; depois os pedidos chegam normalmente.

Opcional: em `js/main.js`, defina `FORMSPREE_ENDPOINT` se preferir Formspree.

## Google Analytics

No `<head>` de todas as páginas há um bloco comentado. Descomente e troque `G-XXXXXXXXXX` pelo ID da propriedade GA4:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Também cadastre o domínio no Google Search Console e envie o `sitemap.xml`.

## Marca

| Token        | Hex       |
|--------------|-----------|
| Azul petróleo | `#1B3A4B` |
| Terracota    | `#C45C26` |
| Fundo        | `#F7F5F2` |
| Texto        | `#2C2C2C` |

Logo oficial: `images/logo.jpg` (wordmark + rolo).

## Sem backend

O site é 100% estático (HTML/CSS/JS). Ideal para nginx em Docker. Não há WhatsApp, redes sociais nem telefone exibido — só formulário.

## Docker Hub

Imagem publicada:

```bash
docker pull clebertsfigueiredo/arte-e-pintura:latest
docker run -d --name arte-pintura -p 80:80 --restart unless-stopped clebertsfigueiredo/arte-e-pintura:latest
```

Tags: `latest`, `1.0.0`  
Hub: https://hub.docker.com/r/clebertsfigueiredo/arte-e-pintura

Repositório: https://github.com/clebsf/arte-e-pintura

