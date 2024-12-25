import React from "react";
import NetworkErrorMessage from "./16sc_NetworkErrorMessage";

type ConnectWalletProps = {
  connectWallet: React.MouseEventHandler<HTMLButtonElement>;
  dismiss: React.MouseEventHandler<HTMLButtonElement>;
  networkError: string | undefined;                                               // означает, что переменная может быть строкой (string), 
                                                                                  // содержащей текст ошибки или может быть undefined, если ошибки
                                                                                  // нет. такой тип удобен для управления состоянием, где значение
                                                                                  // может быть либо доступно, либо отсутствовать, как в случае с
                                                                                  // ошибками.
};

const ConnectWallet: React.FunctionComponent<ConnectWalletProps> = ({             
  connectWallet,
  networkError,
  dismiss,
}) => {
  return (
    <>
      <div>
        {networkError && (                                                         // это логическое И (&&) в JavaScript, которое работает
                                                                                   // следующим образом: если networkError имеет значение
                                                                                   // (например, строку "Wrong network!"), то React выполнит код,
                                                                                   // находящийся после &&, то есть отрендерит компонент
                                                                                   // <NetworkErrorMessage ... />. если networkError равно
                                                                                   // undefined или null, то React ничего не рендерит.
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
      </div>

      <p>Please connect your account...</p>
      <button type="button" onClick={connectWallet}>
        Connect wallet
      </button>
    </>
  );
};

export default ConnectWallet;