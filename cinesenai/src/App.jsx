
import { useEffect, useState } from "react";
import axios from "axios";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from "@mui/material";

import {
  FaSearch,
  FaStar,
  FaFilm
} from "react-icons/fa";

import "./App.css";

// Token configurado no arquivo .env
const API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN;

// Configuração da API TMDB
const API = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    accept: "application/json"
  },
  params: {
    language: "pt-BR"
  }
});

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function App() {
  const [filmes, setFilmes] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [filmeSelecionado, setFilmeSelecionado] = useState(null);

  // Buscar filmes populares
  async function buscarPopulares() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await API.get("/movie/popular");

      setFilmes(resposta.data.results);
    } catch (error) {
      console.error("Erro na API:", error);
      setErro("Não foi possível carregar os filmes. Verifique sua API KEY.");
    } finally {
      setCarregando(false);
    }
  }

  // Pesquisar filmes
  async function pesquisarFilmes(event) {
    event.preventDefault();

    if (!pesquisa.trim()) {
      buscarPopulares();
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const resposta = await API.get("/search/movie", {
        params: {
          query: pesquisa
        }
      });

      setFilmes(resposta.data.results);

      if (resposta.data.results.length === 0) {
        setErro("Nenhum filme encontrado.");
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setErro("Erro ao pesquisar filmes.");
    } finally {
      setCarregando(false);
    }
  }

  // Carregar filmes quando abrir o site
  useEffect(() => {
    buscarPopulares();
  }, []);

  return (
    <>
      {/* MENU */}
      <AppBar position="static" className="navbar">
        <Toolbar>
          <FaFilm size={27} color="#e50914" />

          <Typography variant="h5" className="logo">
            CineSenai
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2">
            Catálogo de Filmes
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">

        {/* APRESENTAÇÃO */}
        <section className="hero">

          <Typography variant="h3">
            Encontre seu próximo filme favorito
          </Typography>

          <Typography variant="body1">
            Explore filmes populares e descubra novas histórias.
          </Typography>

          {/* PESQUISA */}
          <form
            onSubmit={pesquisarFilmes}
            className="search-form"
          >

            <TextField
              fullWidth
              placeholder="Digite o nome de um filme..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              variant="outlined"
              className="search-input"
            />

            <Button
              type="submit"
              variant="contained"
              className="search-button"
              startIcon={<FaSearch />}
            >
              Buscar
            </Button>

          </form>
        </section>

        {/* LISTA DE FILMES */}
        <Box className="section-title">
          <Typography variant="h4">
            Filmes em destaque
          </Typography>
        </Box>

        {/* CARREGAMENTO */}
        {carregando && (
          <Box className="loading">
            <CircularProgress color="error" />
          </Box>
        )}

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <Typography color="error" sx={{ mb: 3 }}>
            {erro}
          </Typography>
        )}

        {/* CARDS */}
        {!carregando && (
          <Grid container spacing={3}>

            {filmes.map((filme) => (

              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={filme.id}
              >

                <Card className="movie-card">

                  <CardMedia
                    component="img"
                    height="350"
                    image={
                      filme.poster_path
                        ? IMAGE_URL + filme.poster_path
                        : "https://placehold.co/500x750?text=Sem+Poster"
                    }
                    alt={filme.title}
                  />

                  <CardContent>

                    <Typography variant="h6">
                      {filme.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {filme.release_date
                        ? filme.release_date.split("-").reverse().join("/")
                        : "Data não informada"}
                    </Typography>

                    <Box className="rating">
                      <FaStar color="#ffc107" />

                      <Typography variant="body2">
                        {Number(filme.vote_average).toFixed(1)} / 10
                      </Typography>
                    </Box>

                  </CardContent>

                  <CardActions>
                    <Button
                      color="error"
                      fullWidth
                      onClick={() => setFilmeSelecionado(filme)}
                    >
                      Ver detalhes
                    </Button>
                  </CardActions>

                </Card>

              </Grid>

            ))}

          </Grid>
        )}

        {/* DETALHES DO FILME */}
        <Dialog
          open={Boolean(filmeSelecionado)}
          onClose={() => setFilmeSelecionado(null)}
          fullWidth
          maxWidth="sm"
        >

          {filmeSelecionado && (
            <>

              <DialogTitle>
                {filmeSelecionado.title}
              </DialogTitle>

              <DialogContent>

                {filmeSelecionado.poster_path && (
                  <img
                    src={IMAGE_URL + filmeSelecionado.poster_path}
                    alt={filmeSelecionado.title}
                    className="dialog-poster"
                  />
                )}

                <Typography sx={{ mt: 2 }}>
                  <strong>Sinopse:</strong>
                </Typography>

                <Typography>
                  {filmeSelecionado.overview ||
                    "Sinopse não disponível."}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  <strong>Nota:</strong>{" "}
                  {Number(filmeSelecionado.vote_average).toFixed(1)}
                </Typography>

                <Typography>
                  <strong>Lançamento:</strong>{" "}
                  {filmeSelecionado.release_date || "Não informado"}
                </Typography>

              </DialogContent>

              <DialogActions>

                <Button
                  color="error"
                  onClick={() => setFilmeSelecionado(null)}
                >
                  Fechar
                </Button>

              </DialogActions>

            </>
          )}

        </Dialog>

      </Container>

      {/* RODAPÉ */}
      <footer className="footer">

        <Typography>
          CineSenai © 2026 - Projeto acadêmico
        </Typography>

        <Typography variant="caption">
          This product uses the TMDB API but is not endorsed
          or certified by TMDB.
        </Typography>

        <Typography variant="caption">
          Dados e imagens fornecidos por TMDB.
        </Typography>

      </footer>
    </>
  );
}

export default App;
