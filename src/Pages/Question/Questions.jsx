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

  const { user } = useContext(UserState);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get("/questions").then((res) => {
      setQuestions(res.data.message);
      setLoading(false);
    });
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const titleMatches = question.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const descriptionMatches = question.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return titleMatches || descriptionMatches;
  });

  // Divide questions into groups of 2 (for 2x2 rows)
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
        <div className={styles.questions_wrapper}>
          {groupedQuestions.map((group, index) => (
            <div
              key={index}
              className={
                group.length === 2
                  ? styles.questions_grid // even group: 2x2
                  : styles.single_question_wrapper // single (odd leftover)
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
      )}
    </div>
  );
}

export default Question;
