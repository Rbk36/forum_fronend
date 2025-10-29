import { useContext, useRef } from "react";
import classes from "./askQuestion.module.css";
import { axiosInstance } from "../../utility/axios.js";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layout.jsx";
import { UserState } from "../../App.jsx";
import Swal from "sweetalert2";

function AskQuestion() {
  const navigate = useNavigate();
  const { user } = useContext(UserState);

  const titleDom = useRef();
  const descriptionDom = useRef();

  const userId = user?.userid;

  async function handleSubmit(e) {
    e.preventDefault();

    const title = titleDom.current.value.trim();
    const description = descriptionDom.current.value.trim();
    const userid = userId;

    if (!userid) {
      // If there's no user, redirect or show error
      await Swal.fire({
        title: "Error",
        text: "You must be logged in to post a question.",
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/auth");
      return;
    }

    try {
      // You may need to include the token header
      const token = localStorage.getItem("Evangadi_Forum");
      const resp = await axiosInstance.post(
        "/question",
        {
          userid,
          title,
          description,
          tag: "General",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.status === 201) {
        await Swal.fire({
          title: "Success!",
          text: "Question created successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        navigate("/");
      } else {
        console.error("Unexpected status:", resp.status, resp.data);
        await Swal.fire({
          title: "Error",
          text: "Failed to create question.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error in creating question:", error);

      let errMsg = "Failed to create question. Please try again later.";
      if (error.response) {
        // If server sent a message
        errMsg = error.response.data?.msg || error.response.data?.Msg || errMsg;
      } else if (error.request) {
        // Request made but no response
        errMsg =
          "No response from server. Please check your network or try again later.";
      }

      await Swal.fire({
        title: "Error",
        text: errMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  return (
    <Layout>
      <div className={classes.allContainer}>
        <div className={classes.question__container}>
          <div className={classes.question__wrapper}>
            <h3 className={classes.question__header__title}>
              <span className={classes.highlight}>
                Steps To Write A Good Question
              </span>
            </h3>
            <div className={classes.questionContainer}>
              <h2 className={classes.questionTitle}>
                How to Ask a Good Question
              </h2>
              <div className={classes.questionList}>
                <ul className={classes.questionListUl}>
                  <li className={classes.questionItem}>
                    <span className={classes.icon}></span>
                    Summarize your problem in a one-line title.
                  </li>
                  <li className={classes.questionItem}>
                    Describe your problem in more detail.
                  </li>
                  <li className={classes.questionItem}>
                    Explain what you've tried and what you expected.
                  </li>
                  <li className={classes.questionItem}>
                    Review your question and post it.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h4 className={classes.highlight}>Post Your Question</h4>
          <div className={classes.question__header__titleTwo}>
            <form onSubmit={handleSubmit} className={classes.question__form}>
              <input
                className={classes.question__title2}
                ref={titleDom}
                type="text"
                placeholder="Question title"
                required
              />
              <textarea
                rows={4}
                className={classes.question__description}
                ref={descriptionDom}
                placeholder="Question Description..."
                required
              />
              <div className={classes.buttonContainer}>
                <button className={classes.question__button} type="submit">
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AskQuestion;
