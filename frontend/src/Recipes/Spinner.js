import React, { useState, useEffect, useRef } from "react";
import styles from "./Spinner.module.css";

const Spinner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const [centerOffset, setCenterOffset] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newFridgeName, setNewFridgeName] = useState("");
  const [Fridges, setFridges] = useState(["Fridge 1", "Fridge 2", "Fridge 3"])

  useEffect(() => {
    if (!sliderRef.current) return;

    const sliderWindow = document.querySelector(`.${styles.sliderWindow}`);
    const sliderWindowHeight = sliderWindow.offsetHeight;
    setCenterOffset(sliderWindowHeight / 2);
  }, []);

  const handleClick = (itemIndex) => {
    setCurrentIndex(itemIndex)
  }

  const createFridge = (newFridge) => {
    setFridges([...Fridges, newFridge])
  }

  const toggleIsCreating = () => setIsCreating((prev) => !prev)

  const calculateOffset = () => {
    if (!sliderRef.current) return 0;
    const sliderItems = sliderRef.current.children;
    let offset = 0;
  
    for (let i = 0; i < currentIndex; i++) {
      offset += sliderItems[i].offsetHeight;
      offset += 10 //include gap
    }
  
    return offset;
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderWindow}>
        <div
          className={styles.sliderTrack}
          ref={sliderRef}
          style={{
            transform: `translateY(calc(${centerOffset}px - ${calculateOffset()}px))`,
          }}
        >
          {Fridges.map((item, index) => (
            <div
              key={index}
              className={styles.sliderItem}
              style={{
                transform: `scale(${
                  1 - Math.abs(currentIndex - index) * 0.15
                })`,
                opacity: Math.max(1 - Math.abs(currentIndex - index) * 0.2, 0),
              }}
              onClick={() => handleClick(index)}
            >
              {item}
            </div>
          ))}
        </div>
      </div> 
      {
        !isCreating ? (
          <div className={styles.createFridge} onClick={toggleIsCreating}>
          Create New Fridge
          </div>
        ) : (
          <div className={styles.inputFridgeName}>
          <input
          type="text"
          name="textInput"
          placeholder="Enter Fridge Name"
          value={newFridgeName}
          onChange={(e) => setNewFridgeName(e.target.value)}
          />
            <button className={styles.inputFridgeName} onClick={() =>{
              createFridge(newFridgeName);
              toggleIsCreating();
              }}>Create</button>
            <button className={styles.inputFridgeName} onClick={toggleIsCreating}>Cancel</button>
          </div>
        )
      }
    </div>
  );
};

export default Spinner;
