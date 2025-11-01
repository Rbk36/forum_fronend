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
  const { user } = useContext(UserState);
  const userId = user?.userid; // currently logged in user's id
  const { questionId } = useParams();

  const [questionDetails, setQuestionDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  const answerInput = useRef();
  const aiPromptInput = useRef();
  const navigate = useNavigate();

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/question/${questionId}`);
      setQuestionDetails(res.data);
    } catch (err) {
      console.error("Error fetching question details:", err);
      Swal.fire({
        title: "Error",
        text: "Could not load question details. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("Evangadi_Forum");
    if (!token) {
      await Swal.fire({
        title: "Unauthorized",
        text: "You must be logged in to submit an answer.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const answerText = answerInput.current.value?.trim();
    if (!answerText) {
      await Swal.fire({
        title: "Error",
        text: "Answer cannot be empty.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/answer",
        {
          userid: userId,
          answer: answerText,
          questionid: questionId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        await Swal.fire({
          title: "Success!",
          text: "Answer submitted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        answerInput.current.value = "";
        await fetchQuestion(); // refresh so new answer appears
      } else {
        console.warn(
          "Unexpected status in handlePostAnswer:",
          response.status,
          response.data
        );
        await Swal.fire({
          title: "Error",
          text:
            response.data?.msg || "Could not submit answer. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error posting answer:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to post answer. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handlePostAIAnswer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("Evangadi_Forum");
    if (!token) {
      await Swal.fire({
        title: "Unauthorized",
        text: "You must be logged in to generate an AI answer.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const prompt = aiPromptInput.current.value?.trim();
    if (!prompt) {
      await Swal.fire({
        title: "Error",
        text: "Prompt is required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setAiLoading(true);
      const response = await axiosInstance.post(
        "/ai/answer",
        { questionid: questionId, prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        await Swal.fire({
          title: "AI Answer Generated!",
          text: "An AI‑generated answer has been posted successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        aiPromptInput.current.value = "";
        await fetchQuestion();
      } else {
        console.warn(
          "Unexpected status in handlePostAIAnswer:",
          response.status,
          response.data
        );
        await Swal.fire({
          title: "Error",
          text: response.data?.msg || "Failed to generate AI answer.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error posting AI answer:", error);
      const status = error.response?.status;
      let message = "Failed to generate AI answer. Please try again later.";
      if (status === 401 || status === 403) {
        message = "Unauthorized. Please login again.";
      } else if (status === 429) {
        message = "Rate limit exceeded. Please try again later.";
      } else if (status === 400) {
        message = error.response?.data?.msg || "Invalid request for AI answer.";
      }
      await Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteQuestion = async (qid) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your question.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) {
      return;
    }

    const token = localStorage.getItem("Evangadi_Forum");
    try {
      const response = await axiosInstance.delete(`/question/${qid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        await Swal.fire({
          title: "Deleted!",
          text: "Your question has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate("/", { replace: true });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Could not delete question.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      await Swal.fire({
        title: "Error",
        text: "Could not delete question. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEditQuestion = (qid) => navigate(`/question/edit/${qid}`);

  const handleDeleteAnswer = async (answerId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your answer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    const token = localStorage.getItem("Evangadi_Forum");
    try {
      const response = await axiosInstance.delete(`/answer/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        await Swal.fire({
          title: "Deleted!",
          text: "Your answer has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
        await fetchQuestion();
      } else {
        await Swal.fire({
          title: "Error",
          text: "Could not delete answer.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error deleting answer:", error);
      await Swal.fire({
        title: "Error",
        text: "Could not delete answer. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEditAnswer = (answerId) => navigate(`/answer/edit/${answerId}`);

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

          {/* Edit/Delete for question owner */}
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
                  onClick={() =>
                    setExpandedAnswer(
                      expandedAnswer === answer.answerid
                        ? null
                        : answer.answerid
                    )
                  }
                >
                  <p className={styles.answerText}>
                    {expandedAnswer === answer.answerid
                      ? answer.answer
                      : answer.answer.slice(0, 100) +
                        (answer.answer.length > 100 ? "… See More" : "")}
                  </p>
                  <p className={styles.answer_date}>
                    <LuCalendarClock style={{ marginRight: "5px" }} size={19} />
                    {moment(answer.createdAt)
                      .format("ddd, MMM DD, YYYY h:mm A")
                      .toUpperCase()}
                  </p>
                </div>
                {/* Edit/Delete for answer owner */}
                {userId === answer.userid && (
                  <div className={styles.answerActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditAnswer(answer.answerid)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteAnswer(answer.answerid)}
                    >
                      Delete
                    </button>
                  </div>
                )}
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
            <h3 className={styles.answerFormTitle}>Answer The Question</h3>
            <Link to="/" className={styles.questionPageLink}>
              Go to Questions Page
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
              <button
                className={styles.postAnswerButton}
                type="submit"
                disabled={aiLoading}
              >
                {aiLoading ? "Generating AI Answer…" : "Generate AI Answer"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default QuestionAndAnswer;
