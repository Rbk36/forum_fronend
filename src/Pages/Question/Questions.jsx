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
  const [currentPage, setCurrentPage] = useState(1);

  const QUESTIONS_PER_PAGE = 4;
  const { user } = useContext(UserState);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/questions")
      .then((res) => {
        setQuestions(res.data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setLoading(false);
      });
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const query = searchQuery.toLowerCase();
    return (
      question.title.toLowerCase().includes(query) ||
      question.description.toLowerCase().includes(query)
    );
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + QUESTIONS_PER_PAGE
  );

  // ✅ Split current questions into 2x2 rows
  const groupedQuestions = [];
  for (let i = 0; i < currentQuestions.length; i += 2) {
    groupedQuestions.push(currentQuestions.slice(i, i + 2));
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className={styles.container}>
      {/* 🔍 Search Bar */}
      <div className={styles.search_question}>
        <input
          type="text"
          placeholder="Search for a question"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to page 1 on search
          }}
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

          {/* ✅ Pagination Controls */}
          <div className={styles.pagination}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={styles.page_button}
            >
              ◀ Prev
            </button>
            <span className={styles.page_info}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.page_button}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Question;
