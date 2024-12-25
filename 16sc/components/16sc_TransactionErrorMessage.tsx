import React from "react";
                                                                           // TransactionErrorMessage предназначен для отображения сообщения об
                                                                           // ошибке транзакции с текстом, переданным через проп message.
                                                                           // показывает кнопку "×", которая вызывает функцию dismiss, переданную
                                                                           // через пропсы. подробное описание работы смотреть в 
                                                                           // NetworkErrorMessage.tsx
type TransactionErrorMessageProps = {
  message: string;
  dismiss: React.MouseEventHandler<HTMLButtonElement>;
};

const TransactionErrorMessage: React.FunctionComponent<
  TransactionErrorMessageProps
> = ({ message, dismiss }) => {
  return (
    <div>
      TX error: {message}
      <button type="button" onClick={dismiss}>
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

export default TransactionErrorMessage;
