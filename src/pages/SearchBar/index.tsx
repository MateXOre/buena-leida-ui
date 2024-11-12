import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  Container,
  Title,
  SearchForm,
  SearchInput,
  SearchButton,
  RadioGroup,
  RadioLabel,
  ResultsContainer,
  ResultCard,
  BookImage,
  BookInfo,
  BookTitle,
  BookAuthor,
  RatingContainer,
  StarRating,
  Synopsis,
  GenreList,
  PublicationDate,
  Spinner,
} from "./styled";
import axios from "axios";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface Book {
  id: number;
  title: string;
  author: string;
  averagerating: number;
  numberreviews: number;
  summary: string;
  genre: string;
  publication_date: string;
  coverimage: string;
}

const SYNOPSIS_MAX_LENGTH = 80;

const API_URL = "http://localhost:3000";

export const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<Book[]>([]);

  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState("todo");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (initialQuery) {
        setIsLoading(true);
        setSearchType("todo");
        setQuery(initialQuery);

        try {
          const response = await axios.get(
            `${API_URL}/books/${initialQuery}/${initialQuery}`
          );
          setData(response.data);
        } catch (err) {
          if ((err as any).response && (err as any).response.status === 404) {
            setData([]);
          } else {
            //console.error(err);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", query);
    console.log("Search type:", searchType);

    setIsLoading(true);

    try {
      const endpoint =
        searchType === "todo"
          ? `${API_URL}/books/${query}/${query}`
          : searchType === "author"
          ? `${API_URL}/books/author/${query}`
          : `${API_URL}/books/title/${query}`;

      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (error) {
      //console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (bookId: number) => {
    console.log("Book clicked:", bookId);
    navigate("/book", { state: { query: bookId } });
  };

  const [rankingMode, setRankingMode] = useState("");

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < Math.floor(rating) ? "#FFD700" : "none"}
          stroke={i < Math.floor(rating) ? "#FFD700" : "#000000"}
        />
      ));
  };

  const [showSortMenu, setShowSortMenu] = useState(true);

  return (
    <Container>
      <Title>Buscar</Title>
      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query"
        />
        <SearchButton type="submit">Buscar</SearchButton>
      </SearchForm>
      <RadioGroup style={{ marginTop: "40px", gap: "30px" }}>
        <RadioLabel>
          <input
            type="radio"
            value="todo"
            checked={searchType === "todo"}
            onChange={() => {
              setSearchType("todo");
              setShowSortMenu(true);
            }}
          />
          Todo
        </RadioLabel>
        <RadioLabel>
          <input
            type="radio"
            value="title"
            checked={searchType === "title"}
            onChange={() => {
              setSearchType("title");
              setShowSortMenu(true);
            }}
          />
          Título
        </RadioLabel>
        <RadioLabel>
          <input
            type="radio"
            value="author"
            checked={searchType === "author"}
            onChange={() => {
              setSearchType("author");
              setShowSortMenu(true);
            }}
          />
          Autor
        </RadioLabel>
        <RadioLabel>
          <input
            type="radio"
            value="user"
            checked={searchType === "user"}
            onChange={() => {
              setSearchType("user");
              setShowSortMenu(false);
              setRankingMode("Default");
            }}
          />
          Usuario
        </RadioLabel>

        <FormControl
          variant="standard"
          sx={{ minWidth: 120, marginBottom: "0px" }}
        >
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={rankingMode}
            onChange={(event) => setRankingMode(event.target.value)}
          >
            <MenuItem value={"rankings"}>Ranking</MenuItem>
            <MenuItem value={"Default"}>Default</MenuItem>
          </Select>
        </FormControl>
      </RadioGroup>
      <ResultsContainer>
        {isLoading ? (
          <Spinner />
        ) : data.length === 0 ? (
          <p>No se encontraron libros para los parámetros especificados</p>
        ) : (
          data.map((book) => (
            <ResultCard key={book.id}>
              <BookImage
                src={book.coverimage}
                alt={book.title}
                onClick={() => handleBookClick(book.id)}
              />
              <BookInfo>
                <BookTitle onClick={() => handleBookClick(book.id)}>
                  {book.title}
                </BookTitle>
                <BookAuthor>{book.author}</BookAuthor>

                <RatingContainer>
                  <StarRating>{renderStars(book.averagerating)}</StarRating>
                  <span>{book.averagerating.toFixed(1)}</span>
                  <span>
                    ({book.numberreviews}{" "}
                    {book.numberreviews === 1
                      ? "calificación"
                      : "calificaciones"}
                    )
                  </span>
                </RatingContainer>
                <Synopsis>
                  {book.summary.length > SYNOPSIS_MAX_LENGTH
                    ? `${book.summary.slice(0, SYNOPSIS_MAX_LENGTH - 3)}...`
                    : book.summary}
                </Synopsis>
                <GenreList>Genero: {book.genre}</GenreList>
                <PublicationDate>
                  Publicado:{" "}
                  {new Date(book.publication_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </PublicationDate>
              </BookInfo>
            </ResultCard>
          ))
        )}
      </ResultsContainer>
    </Container>
  );
};

export default SearchBar;
