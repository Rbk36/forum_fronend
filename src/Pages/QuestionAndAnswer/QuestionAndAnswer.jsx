// QuestionAndAnswer.jsx
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utility/axios.js";
import Layout from "../../Layout/Layout.jsx";
import styles from "./answer.module.css";
import { MdAccountCircle } from "react-icons/md";
import { FaClipboardQuestion } from "react-icons/fa6";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import moment from "moment";
import { UserState } from "../../App.jsx";
import { LuCalendarClock } from "react-icons/lu";
import Swal from "sweetalert2";

function QuestionAndAnswer() {
  const [questionDetails, setQuestionDetails] = useState({});
  const { user } = useContext(UserState);
  const userId = user?.userid;
  const { questionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const answerInput = useRef();
  const aiPromptInput = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get(`/question/${questionId}`)
      .then((res) => setQuestionDetails(res.data))
      .catch((err) => {
        console.error("Error fetching question details:", err);
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  async function handlePostAnswer(e) {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/answer", {
        userid: userId,
        answer: answerInput.current.value,
        questionid: questionId,
      });
      if (response.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Answer submitted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => window.location.reload());
      }
    } catch (error) {
      console.error("Error posting answer:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to post answer. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  async function handlePostAIAnswer(e) {
    e.preventDefault();
    const prompt = aiPromptInput.current.value?.trim();
    if (!prompt) {
      Swal.fire({
        title: "Error",
        text: "Prompt is required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/ai/answer", {
        questionid: questionId,
        prompt,
      });

      if (response.status === 201) {
        Swal.fire({
          title: "AI Answer Generated!",
          text: "The AI-generated answer has been posted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => navigate(`/question/${questionId}`, { replace: true }));
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to generate AI answer.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error posting AI answer:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to generate AI answer. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  async function handleDeleteQuestion(qid) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your question.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/question/${qid}`);
        if (response.status === 200) {
          Swal.fire(
            "Deleted!",
            "Your question has been deleted.",
            "success"
          ).then(() => navigate("/", { replace: true }));
        } else {
          Swal.fire("Error", "Could not delete question.", "error");
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        Swal.fire(
          "Error",
          "Could not delete question. Please try again.",
          "error"
        );
      }
    }
  }

  function handleEditQuestion(qid) {
    navigate(`/question/edit/${qid}`);
  }

  const truncateText = (text, limit = 50) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > limit) {
      return (
        <>
          {words.slice(0, limit).join(" ")}{" "}
          <span
            style={{ color: "var(--blue-shade)", cursor: "pointer" }}
            onClick={() => setExpandedAnswer(null)}
          >
            ... See More
          </span>
        </>
      );
    }
    return text;
  };

  const toggleExpandAnswer = (answerId) =>
    setExpandedAnswer(expandedAnswer === answerId ? null : answerId);

  if (loading) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          {/* Question Header */}
          <div style={{ display: "flex" }}>
            <FaClipboardQuestion size={35} style={{ marginRight: "10px" }} />
            <div>
              <h1 className={styles.questionTitle}>{questionDetails?.title}</h1>
              <p className={styles.questionDescription}>
                {questionDetails?.description}
              </p>
              <p className={styles.question_date}>
                Asked by:{" "}
                <span style={{ fontWeight: "600" }}>
                  @{questionDetails?.qtn_username}
                </span>
                <br />
                <LuCalendarClock style={{ marginRight: "5px" }} size={19} />
                {moment(questionDetails.qtn_createdAt)
                  .format("ddd, MMM DD, YYYY h:mm A")
                  .toUpperCase()}
              </p>
            </div>
          </div>

          {/* Show Edit/Delete only for question owner */}
          {userId === questionDetails.userid && (
            <div className={styles.questionActions}>
              <button
                className={styles.editButton}
                onClick={() => handleEditQuestion(questionDetails.questionid)}
              >
                Edit Question
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteQuestion(questionDetails.questionid)}
              >
                Delete Question
              </button>
            </div>
          )}

          {/* Answers */}
          <h2
            style={{ padding: "5px 0", textAlign: "left", fontWeight: "600" }}
          >
            <MdOutlineQuestionAnswer
              size={35}
              style={{ marginRight: "10px" }}
            />
            Answers From the Community:
          </h2>

          {questionDetails?.answers?.length > 0 ? (
            questionDetails.answers.map((answer) => (
              <div key={answer.answerid} className={styles.answer_holder}>
                <div className={styles.account_holder}>
                  <MdAccountCircle size={50} />
                  <div className={styles.profileName}>@{answer.username}</div>
                </div>
                <div
                  className={styles.answerTextContainer}
                  onClick={() => toggleExpandAnswer(answer.answerid)}
                >
                  <p className={styles.answerText}>
                    {expandedAnswer === answer.answerid
                      ? answer.answer
                      : truncateText(answer.answer)}
                  </p>
                  <p className={styles.answer_date}>
                    <LuCalendarClock style={{ marginRight: "5px" }} size={19} />
                    {moment(answer.createdAt)
                      .format("ddd, MMM DD, YYYY h:mm A")
                      .toUpperCase()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>
              <span style={{ color: "red", fontWeight: "bold" }}>
                No answers yet!
              </span>
              <br />
              Be the first to contribute your answer and help the community.
            </p>
          )}

          {/* User Answer Form */}
          <section className={styles.answerFormSection}>
            <h3 className={styles.answerFormTitle}>Answer The Top Question</h3>
            <Link to="/" className={styles.questionPageLink}>
              Go to Question page
            </Link>
            <form onSubmit={handlePostAnswer}>
              <textarea
                placeholder="Your Answer..."
                className={styles.answerInput}
                required
                ref={answerInput}
              />
              <button className={styles.postAnswerButton} type="submit">
                Post Your Answer
              </button>
            </form>
          </section>

          {/* AI Answer Form */}
          <section
            className={styles.aiAnswerFormSection}
            style={{ marginTop: "2rem" }}
          >
            <h3 className={styles.answerFormTitle}>
              Let AI Help Answer This Question
            </h3>
            <form onSubmit={handlePostAIAnswer}>
              <textarea
                placeholder="Ask the AI for help..."
                className={styles.answerInput}
                ref={aiPromptInput}
              />
              <button className={styles.postAnswerButton} type="submit">
                Generate AI Answer
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default QuestionAndAnswer;
