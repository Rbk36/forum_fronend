import { useEffect, useState, useContext } from "react";
import styles from "./questions.module.css";
import { axiosInstance } from "../../utility/axios.js";
import QuestionCard from "../../components/QuestionCard/QuestionCard.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { UserState } from "../../App.jsx";

function Question() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useContext(UserState);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/questions?page=${page}&limit=6`);
        setQuestions(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const filteredQuestions = questions.filter((question) => {
    const titleMatches = question.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const descriptionMatches = question.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return titleMatches || descriptionMatches;
  });

  const groupedQuestions = [];
  for (let i = 0; i < filteredQuestions.length; i += 2) {
    groupedQuestions.push(filteredQuestions.slice(i, i + 2));
  }

  return (
    <div className={styles.container}>
      <div className={styles.search_question}>
        <input
          type="text"
          placeholder="Search for a question"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <hr />
      <h1 className={styles.title}>Questions</h1>

      {loading ? (
        <Loader />
      ) : filteredQuestions.length === 0 ? (
        <div className={styles.no_questions}>
          <p>No Questions Found</p>
        </div>
      ) : (
        <>
          <div className={styles.questions_wrapper}>
            {groupedQuestions.map((group, index) => (
              <div
                key={index}
                className={
                  group.length === 2
                    ? styles.questions_grid
                    : styles.single_question_wrapper
                }
              >
                {group.map((question) => (
                  <QuestionCard
                    key={question.questionid}
                    id={question.questionid}
                    userName={question.username}
                    questionTitle={question.title}
                    description={question.description}
                    question_date={question.createdAt}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className={styles.paginationControls}>
            <button onClick={handlePrev} disabled={page === 1}>
              Previous
            </button>
            <span>
              {" "}
              Page {page} of {totalPages}{" "}
            </span>
            <button onClick={handleNext} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Question;
