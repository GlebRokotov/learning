import React from "react";
                                                                       // NetworkErrorMessage предназначен для отображения ошибки сети с
                                                                       // возможностью её закрытия

type NetworkErrorMessageProps = {                                      // описывает структуру объекта пропсов, которые передаются в компонент
                                                                       // NetworkErrorMessage.
  message: string;
  dismiss: React.MouseEventHandler<HTMLButtonElement>;                 // тип обработчика событий, который React предоставляет для работы с
                                                                       // событиями мыши. указывает, что dismiss — это функция, которая принимает
                                                                       // событие клика мыши на элементе <button>.
};

const NetworkErrorMessage: React.FunctionComponent<                    // const NetworkErrorMessage: создаёт функциональный компонент React. это
                                                                       // современный способ объявления компонентов вместо использования классов.
  NetworkErrorMessageProps                                             // React.FunctionComponent<NetworkErrorMessageProps>: указывает, что
                                                                       // компонент является функциональным компонентом. в качестве типа пропсов
                                                                       // используется NetworkErrorMessageProps, описанный ранее.
> = ({ message, dismiss }) => {
  return (                                                             // возвращает разметку (JSX), которая описывает, как компонент будет
                                                                       // выглядеть на экране.

    <div>                                                              {/*<div> это контейнер, который группирует сообщение и кнопку */}
      {message}                                                        
      <button type="button" onClick={dismiss}>                         {/*<button> — кнопка, которая позволяет пользователю закрыть сообщение.
                                                                          атрибуты кнопки: type="button" указывает тип кнопки. здесь используется
                                                                          "button", чтобы предотвратить поведение кнопки по умолчанию (например,
                                                                          отправка формы). onClick={dismiss} связывает функцию dismiss с событием
                                                                          onClick. когда пользователь нажимает на кнопку, вызывается переданная
                                                                          функция dismiss.*/}

        <span aria-hidden="true">&times;</span>                         {/*<span> cлужит для отображения содержимого кнопки, в данном случае
                                                                           символа "×". это стандартный HTML-символ (&times;), который отобразится
                                                                           как знак умножения "×". aria-hidden="true" указывает, что этот элемент
                                                                           скрыт для вспомогательных технологий (например, экранных читалок). это
                                                                           делается для того, чтобы читалка не произносила "×", а сосредоточилась
                                                                           на более понятном контексте (например, "Close"). */}
      </button>
    </div>
  );
};

export default NetworkErrorMessage;