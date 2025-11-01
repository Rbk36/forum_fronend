import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
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

  useEffect(() => {
    const fetchAIAnswer = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post("/ai/answer", {
          questionId,
          userId: user?.id,
        });
        setAiAnswer(response.data.answer);
      } catch (error) {
        console.error("Error generating AI answer:", error);
        console.error("Stack:", error.stack);
        if (error.response) {
          console.error("API Response error data:", error.response.data);
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to generate AI answer.",
          error: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAIAnswer();
    }
  }, [questionId, user?.id]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <FaRobot size={30} />
          <h1>AI Answer</h1>
        </div>
        {loading && <p>Loading AI-generated answer...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {aiAnswer && !loading && !error && (
          <div className={styles.answer}>
            <ReactMarkdown>{aiAnswer}</ReactMarkdown>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AIAnswer;
