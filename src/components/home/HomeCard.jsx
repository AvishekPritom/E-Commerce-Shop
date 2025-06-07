import styles from "./HomeCard.module.css";
import { Link } from "react-router-dom";

const HomeCard = () => {
  return (
    <div className={`col-md-3 ${styles.col}`}>
      <Link to="/detail" className={styles.link}>
        <div className={Styles.card}>
          <div className={styles.cardImaWrapper}>
            <img src="" className={styles.cardImgTop} alt="Product Image" />
          </div>
          <div className={styles.cardBody}>
            <h5 className={`${styles.cardTittle} mb-1`}>Product Name</h5>
            <h6 className={styles.cardText}>$100.00</h6>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HomeCard;
