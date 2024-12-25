import React from "react";
                                                                           // WaitingForTransactionMessage предназначен для отображения сообщения
                                                                           // о статусе ожидания транзакции, включая динамически подставленный хэш
                                                                           // транзакции. подробное описание работы смотреть в 
                                                                           // NetworkErrorMessage.tsx
type WaitingForTransactionMessageProps = {
  txHash: string;
};

const WaitingForTransactionMessage: React.FunctionComponent<
  WaitingForTransactionMessageProps
> = ({ txHash }) => {
  return (
    <div>
      Waiting for transaction <strong>{txHash}</strong>                     {/*тег <strong> в HTML (и JSX) используется для выделения текста с
                                                                               акцентом, что обычно отображается как жирный текст в браузере. */}
    </div>
  );
};

export default WaitingForTransactionMessage;