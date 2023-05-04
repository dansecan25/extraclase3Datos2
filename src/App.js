import React, { useState } from "react";

import Wrapper from "./components/Wrapper"; //el frame de la calculadora
import Screen from "./components/Screen"; //la pantalla donde iran los numeros
import ButtonBox from "./components/ButtonBox"; //la caja con los botones
import Button from "./components/Button"; //botones

const client = new WebSocket('ws://localhost:8080');

client.addEventListener('error', (event) => {
  throw new Error('Failed to connect to server');
});

const btnValues = [
  ["C", "+-", "%", "/"],
  [7, 8, 9, "X"],
  [4, 5, 6, "-"],
  [1, 2, 3, "+"],
  [0, ".", "="],
]; //matriz con los valores de los botones
//separa los numeros cada milesima
const toLocaleString = (num) =>
  String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, "$1 ");
//elimina espacios en blanco
const removeSpaces = (num) => num.toString().replace(/\s/g, "");

const App = () => {//define un componente de react y de ahi su la calculadora 
  let [calc, setCalc] = useState({
    sign: "", //inicializa el signo
    num: 0, //inicializa el valor del numero inicial
    res: 0, //inicializa el valor del resultado
  });

  const numClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    if (removeSpaces(calc.num).length < 16) {
      setCalc({
        ...calc,
        num:
          calc.num === 0 && value === "0"
            ? "0"
            : removeSpaces(calc.num) % 1 === 0
            ? toLocaleString(Number(removeSpaces(calc.num + value)))
            : toLocaleString(calc.num + value),
        res: !calc.sign ? 0 : calc.res,
      });
    }
  };
  //funcion para dibujar decimales
  const commaClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    setCalc({
      ...calc,
      num: !calc.num.toString().includes(".") ? calc.num + value : calc.num,
    });
  };

  const signClickHandler = (e) => { //guarda el signo presionado
    e.preventDefault();
    const value = e.target.innerHTML; //obtiene el valor presionado

    setCalc({
      ...calc,
      sign: value,
      res: !calc.res && calc.num ? calc.num : calc.res,
      num: 0,
    });
  };

  const equalsClickHandler = async () => {
    if (calc.sign && calc.num) {
      const equation = `${removeSpaces(calc.res)}${calc.sign}${removeSpaces(calc.num)}`;
      client.send(equation);
      const result = await new Promise((resolve) => {
        client.addEventListener('message', (event) => {
          const data = event.data;
          console.log(`Received from server: ${data}`);
          resolve(data);
        });
      });
      setCalc({
        ...calc,
        res: calc.num === "0" && calc.sign === "/" ? "Can't divide with 0"
          : toLocaleString(result),
        sign: "",
        num: "",
      });
    }
  };
  

  const invertClickHandler = () => {
    setCalc({
      ...calc,
      num: calc.num ? toLocaleString(removeSpaces(calc.num) * -1) : 0,
      res: calc.res ? toLocaleString(removeSpaces(calc.res) * -1) : 0,
      sign: "",
    });
  };

  const percentClickHandler = async () => {
    let num = calc.num ? parseFloat(removeSpaces(calc.num)) : 0;
    let res = calc.res ? parseFloat(removeSpaces(calc.res)) : 0;
    const equation1 = `${calc.sign}${num}`;
      client.send(equation1);
      const result1 = await new Promise((resolve) => {
        client.addEventListener('message', (event) => {
          const data = event.data;
          console.log(`Received from server: ${data}`);
          resolve(data);
        });
      });
      const equation2 = `${calc.sign}${res}`;
      client.send(equation2);
      const result2 = await new Promise((resolve) => {
        client.addEventListener('message', (event) => {
          const data = event.data;
          console.log(`Received from server: ${data}`);
          resolve(data);
        });
      });

    setCalc({
      ...calc,
      num: result1,
      res: result2,
      sign: "",
    });
  };

  const resetHandler = () => { //resetea los numeros de la calculadora
    setCalc({
      ...calc,
      sign: "",
      num: 0,
      res: 0,
    });
  };

  return (
    <Wrapper>
      <Screen value={calc.num ? calc.num : calc.res} /> 
      <ButtonBox>
        {btnValues.flat().map((btn, i) => { //define un mapa en el que se colocan los botones en la app
          return (
            <Button
              key={i}
              className={btn === "=" ? "equals" : ""}
              value={btn}
              onClick={
                btn === "C" ? resetHandler //el : es como un else, y el ? dice que hace
                  : btn === "+-" ? invertClickHandler
                  : btn === "%" ? percentClickHandler
                  : btn === "=" ? equalsClickHandler
                  : btn === "/" || btn === "X" || btn === "-" || btn === "+" ? signClickHandler
                  : btn === "." ? commaClickHandler
                  : numClickHandler
              }
            />
          );
        })}
      </ButtonBox>
    </Wrapper>
  );
};

export default App;
