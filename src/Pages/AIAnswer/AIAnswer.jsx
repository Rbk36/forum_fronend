// // components/AIAnswer.js
// import { useState } from "react";
// import { axiosInstance } from "../../utility/axios";
// import styles from "../../Pages/AIAnswer/AIAnswer.module.css"; // Ensure this CSS module exists for styling

// const AIAnswer = () => {
//   const [question, setQuestion] = useState("");
//   const [aiResponse, setAiResponse] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleAsk = async (e) => {
//     e.preventDefault();
//     if (!question.trim()) return;

//     setLoading(true);
//     try {
//       const response = await axiosInstance.post("/api/v1/ai/answer", {
//         question,
//       });
//       setAiResponse(response.data.answer);
//     } catch (error) {
//       console.error("Error fetching AI answer:", error);
//       setAiResponse("Sorry, I couldn't fetch an answer at the moment.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2>Ask AI</h2>
//       <form onSubmit={handleAsk}>
//         <textarea
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="Ask your question..."
//           rows="4"
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Thinking..." : "Ask AI"}
//         </button>
//       </form>
//       {aiResponse && (
//         <div className={styles.answer}>
//           <strong>AI says:</strong> {aiResponse}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIAnswer;
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
        const response = await axiosInstance.post("/api/v1/ai/answer", {
          questionId,
          userId: user?.id,
        });
        setAiAnswer(response.data.answer);
      } catch (err) {
        setError("Failed to fetch AI answer. Please try again later.");
        Swal.fire({
          title: "Error",
          text: "Failed to fetch AI answer. Please try again later.",
          icon: "error",
          confirmButtonText: "OK",
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
