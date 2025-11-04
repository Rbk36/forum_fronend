import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utility/axios";
import Layout from "../../Layout/Layout";
import { UserState } from "../../App";
import styles from "../../Pages/AIAnswer/AIAnswer.module.css";
import { FaRobot } from "react-icons/fa";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";

function AIAnswer() {
  const { questionId } = useParams();
  const { user } = useContext(UserState);
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAIAnswer = async () => {
      if (!user?.userid) {
        // If user not logged in redirect or show warning
        await Swal.fire({
          title: "Unauthorized",
          text: "You must be logged in to use AI answer.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        navigate("/", { replace: true });
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("Evangadi_Forum");
        const response = await axiosInstance.post(
          "/suggest-ai-answer",
          {
            questionid: questionId,
            prompt: "", // optionally if prompt required
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000, // add timeout
          }
        );
        setAiAnswer(response.data.answer);
      } catch (err) {
        console.error("Error generating AI answer:", err);
        if (err.code === "ECONNABORTED") {
          setError("Request timed out. Please try again.");
        } else {
          setError(
            err.response?.data?.message || "Failed to generate AI answer."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnswer();
  }, [questionId, user?.userid, navigate]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <FaRobot size={30} />
          <h1>AI Answer</h1>
        </div>
        {loading && <p>Loading AI-generated answer...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.answer}>
            <ReactMarkdown>{aiAnswer}</ReactMarkdown>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AIAnswer;
