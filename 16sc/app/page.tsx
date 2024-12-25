"use client";                                                            // указывает, что этот файл должен выполняться на клиентской стороне
                                                                         // (в браузере), а не на сервере. это важно для Next.js, так как
                                                                         // взаимодействие с Metamask и Ethereum API возможно только на клиенте.
                                                                         // cмарт-контракт 16sc_MusicShop.sol реализует бизнес-логику на стороне
                                                                         // блокчейна. это "серверная" часть, но она работает на блокчейне,
                                                                         // а не на традиционном сервере. контракт развернут с помощью hardhat,
                                                                         // и серверная логика выполняется на локальном блокчейне (или тестовой
                                                                         // сети, если развернуть его там). клиентская часть — фронтенд на Next.js.
                                                                         // это клиентское приложение, которое запускается в браузере. оно 
                                                                         // взаимодействует с контрактом через локальную сеть Hardhat (или
                                                                         // выбранную блокчейн-сеть). проект использует децентрализованную 
                                                                         // архитектуру, где серверной логикой управляет смарт-контракт на
                                                                         // блокчейне (hardhat). клиентская часть предоставляет интерфейс
                                                                         // пользователю через Next.js. примененный подход типичен для dApp
                                                                         // он даёт -прозрачность: серверная логика доступна всем в виде открытого
                                                                         // смарт-контракта. -децентрализацию: нет традиционного центрального
                                                                         // сервера. -совместимость: любой пользователь с браузером и кошельком
                                                                         // (например, Metamask) может взаимодействовать с приложением.

import React, { useState, useEffect, FormEvent } from "react";           // useState для хранения состояния компонента (например, хэш транзакции,
                                                                         // баланс и т.д.), useEffect для выполнения побочных эффектов,
                                                                         // FormEvent: Типизация событий формы в TypeScript.
import { ethers } from "ethers";
import { MusicShop__factory } from "@/typechain";                        // фабрика позволяет создать экземпляр контракта, предоставляет метод для
                                                                         // создания экземпляра контракта на основе адреса контракта и подписчика
                                                                         // (signer). типизирует контракт, используя фабрику, TypeChain генерирует
                                                                         // типы для контракта, что позволяет работать с ним с полной поддержкой 
                                                                         // типов (для методов и параметров). позволяет вызывать методы контракта:
                                                                         // через объект, созданный фабрикой, можно вызывать методы контракта,
                                                                         // такие как addAlbum, buy и другие. фабрика предоставляет два основных
                                                                         // метода: connect(address, signerOrProvider) который создаёт экземпляр
                                                                         // контракта по его адресу и добавляет подписчика (signer) или провайдера
                                                                         // (provider) для взаимодействия. deploy(...) если контракт не был
                                                                         // развернут, фабрика может развернуть его с указанными параметрами
                                                                         // конструктора.
import type { MusicShop } from "@/typechain";
import type { BrowserProvider } from "ethers";                           // BrowserProvider используется для подключения к Ethereum через браузер
                                                                         // (например, через Metamask). BrowserProvider экспортируется из
                                                                         // библиотеки ethers версии 6+. этот тип описывает провайдера, который
                                                                         // взаимодействует с Ethereum через браузер, используя API window.ethereum.
                                                                         // window.ethereum это глобальный объект. после установки Metamask
                                                                         // в браузере, объект window.ethereum становится доступен в глобальной 
                                                                         // области (как, например, window.location или window.document). этот
                                                                         // объект служит точкой взаимодействия между приложением и блокчейном. это
                                                                         // мост между приложением и блокчейном через кошелёк пользователя.
import ConnectWallet from "@/components/16sc_ConnectWallet";
import WaitingForTransactionMessage from "@/components/16sc_WaitingForTransactionMessage";
import TransactionErrorMessage from "@/components/16sc_TransactionErrorMessage";
import NetworkErrorMessage from "@/components/16sc_NetworkErrorMessage";

const HARDHAT_NETWORK_ID = "0x539";                                      // в ethereum chainId обычно записывается в шестнадцатеричном формате.
                                                                         // например: 0x1 — mainnet, 0x5 — goerli testnet, 0x539 — hardhat network
                                                                         // (1337).
const MUSIC_SHOP_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

declare let window: any;                                                 // TypeScript по умолчанию использует строгую типизацию. если обратиться
                                                                         // к window.ethereum без явного указания его существования, TypeScript
                                                                         // выдаст ошибку, так как свойство window.ethereum в стандартной
                                                                         // библиотеке TypeScript не определено. declare let window: any; отключает
                                                                         // эту проверку и позволяет обращаться к window.ethereum без ошибок.

type CurrentConnectionProps = {                                          // символ | означает union-тип, который позволяет свойству иметь несколько
                                                                         // типов. тип CurrentConnectionProps описывает объект с тремя свойствами:
                                                                         // provider, shop, и signer. каждое свойство может быть либо своим
                                                                         // основным типом (BrowserProvider, MusicShop, JsonRpcSigner), либо
                                                                         // undefined. такой подход обеспечивает строгую типизацию и позволяет
                                                                         // учитывать временное отсутствие значений.
  provider: BrowserProvider | undefined;
  shop: MusicShop | undefined;
  signer: ethers.JsonRpcSigner | undefined;
};

type AlbumProps = {
  index: ethers.BigNumberish;
  uid: string;
  title: string;
  price: ethers.BigNumberish;
  quantity: ethers.BigNumberish;
};

export default function Home() {                                          // основной компонент страницы Home, который управляет всем приложением.
                                                                          // компонент Home будет рендериться на главной странице localhost:3000

  const [networkError, setNetworkError] = useState<string>();             // const [переменная_содержащая_начальное_состояние,
                                                                          // функция_для_обновления_значения_состояния]
                                                                          // = useState(начальное_значения_состояния); состояния в React хранят
                                                                          // данные, которые могут изменяться и автоматически вызывают повторный
                                                                          // рендеринг компонента при изменении. в данном случае указано, что
                                                                          // состояние хранит строку (string) или undefined. так как нет начального
                                                                          // значения, то в этом случае состояние по умолчанию равно undefined
  const [txBeingSent, setTxBeingSent] = useState<string>();
  const [transactionError, setTransactionError] = useState<any>();        // <any> используется тут так как ошибка может быть разного формата. 
                                                                          // например, ошибки, полученные из разных источников (из контракта 
                                                                          // Ethereum, библиотеки ethers.js, или других API).
  const [currentBalance, setCurrentBalance] = useState<string>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [albums, setAlbums] = useState<AlbumProps[]>([]);                 // albums будет массивом объектов типа AlbumProps. здесь начальное
                                                                          // значение — это пустой массив. это значит, что в момент инициализации
                                                                          // albums не будет undefined, а будет равен [] (массив без элементов).
  const [currentConnection, setCurrentConnection] =
    useState<CurrentConnectionProps>();

  useEffect(() => {                                                        // обновляет баланс пользователя при изменении подключения
                                                                           // (currentConnection) или отправке транзакции (txBeingSent). синтаксис
                                                                           // useEffect: useEffect(() => { // код эффекта }, [зависимости]);
                                                                           // первый аргумент — это функция, в которой описывается побочный эффект.
                                                                           // второй аргумент — массив зависимостей. эффект будет запускаться
                                                                           // каждый раз, когда изменяются значения из этого массива и после
                                                                           // первого рендера. currentConnection?.provider тут оператор ?.
                                                                           // (optional chaining) проверяет, что currentConnection существует и
                                                                           // что у него есть свойство provider. после этого передаёт строку в 
                                                                           // переменную currentBalance
    (async () => {
      if (currentConnection?.provider && currentConnection.signer) {
        setCurrentBalance(
          (
            await currentConnection.provider.getBalance(
              currentConnection.signer.address,
              await currentConnection.provider.getBlockNumber(),
            )
          ).toString()
        );
      }
    })();
  }, [currentConnection, txBeingSent]);

                                                                            // в контракте MusicShop определён массив albums, который хранит все
                                                                            // альбомы в виде массива структур Album. функция .allAlbums() 
                                                                            // возвращает массив альбомов albumsList. на стороне клиента 
                                                                            // когда контракт возвращает массив структур через JSON-RPC (например,
                                                                            // в Ethers.js), массив Album[] преобразуется в массив массивов, где
                                                                            // каждый элемент массива (например, [0, "abc123", "Greatest Hits",
                                                                            // 100, 50]) представляет одну структуру Album. массив массивов
                                                                            // неудобен для работы так как для обращения к данным приходится
                                                                            // использовать индексы (album[2] вместо album.title). преобразование
                                                                            // в объект типа AlbumProps позволяет использовать понятные поля 
                                                                            // album.title; вместо album[2].
  useEffect(() => {
    (async () => {
      if (currentConnection?.shop && currentConnection.signer) {
        const newAlbums = (await currentConnection.shop.allAlbums()).map(   // .map(...) преобразует массив данных, возвращённый .allAlbums(), в
                                                                            // новый массив объектов AlbumProps. .map(...) — метод массива,
                                                                            // который выполняет перебор элементов массива и применяет функцию
                                                                            // преобразования к каждому элементу. на каждой итерации передаёт
                                                                            // текущий элемент (один массив) в колбэк-функцию. этот текущий элемент
                                                                            // получает название album и становится доступным в аргументе функции.
                                                                            // текущий массив album преобразуется в объект AlbumsProps и далее
                                                                            // все такие объекты добавляются в новый массив newAlbums.
          (album): AlbumProps => {
            return {
              index: album[0].toString(),
              uid: album[1],
              title: album[2],
              price: album[3],
              quantity: album[4],
            };
          }
        );

        setAlbums(newAlbums);                                               // обновляет состояние albums с помощью функции setAlbums используя
                                                                            // встроенный хук useState, добавляя новый массив newAlbums к уже
                                                                            // существующему массиву albums. это происходит в контексте того, как 
                                                                            // Данные об альбомах проходят путь: 1. пользователь → клиент 
                                                                            // → контракт → блокчейн 2. блокчейн → контракт → клиент → интерфейс.

        setIsOwner(                                                         // проверяется, является ли текущий пользователь владельцем контракта.
                                                                            // currentConnection.shop.owner() возвращает адрес владельца, а 
                                                                            // currentConnection.signer.getAddress() получает адрес текущего
                                                                            // пользователя. состояние isOwner управляет отображением определённых
                                                                            // частей интерфейса, например, формы для добавления альбомов. если
                                                                            // isOwner обновится на false - части интерфейса, зависящие от isOwner,
                                                                            // исчезнут
          ethers.getAddress(await currentConnection.shop.owner()) ===
            (await currentConnection.signer.getAddress())
        );
      }
    })();
  }, [currentConnection]);

  const _connectWallet = async () => {                                       // функция для подключения кошелька. функция запускается вручную,
                                                                             // когда пользователь, например, нажимает кнопку "Connect Wallet".
                                                                             // она проверяет, установлен ли кошелёк, запрашивает у MetaMask
                                                                             // разрешение на подключение аккаунта, настраивает начальное
                                                                             // подключение через _initialize. подписывается на события
                                                                             // (accountsChanged, chainChanged). после выполнения _connectWallet,
                                                                             // если всё прошло успешно, приложение будет подключено к активному
                                                                             // аккаунту.
    if (window.ethereum === undefined) {
      setNetworkError("Please install Metamask!");

      return;                                                                // если window.ethereum отсутствует return; останавливает выполнение
                                                                             // функции.
    }

    if (!(await _checkNetwork())) {                                          // если _checkNetwork() вернул false, блок внутри if выполнится
      return;
    }

    const [selectedAccount] = await window.ethereum.request({                // window.ethereum.request запрашивает у metamask список подключённых
                                                                             // аккаунтов. eth_requestAccounts возвращает массив с адресами
                                                                             // аккаунтов. const [selectedAccount] берёт первый аккаунт из массива
                                                                             // metamask автоматически выделяет первый аккаунт как активный. в
                                                                             // большинстве кошельков, таких как metamask, первым в массиве будет
                                                                             // аккаунт, который сейчас выбран в интерфейсе. это тот аккаунт,
                                                                             // который пользователь видит в интерфейсе кошелька и который
                                                                             // подписывает транзакции.
      method: "eth_requestAccounts",
    });

    await _initialize(ethers.getAddress(selectedAccount));                   // вызываем функцию _initialize, которая настраивает provider, signer
                                                                             // и экземпляр контракта. сохраняет эти данные в состоянии
                                                                             // (currentConnection).

    window.ethereum.on(                                                      // accountsChanged — это стандартное встроенное событие в объекте
                                                                             // window.ethereum. это часть спецификации EIP-1193, которая
                                                                             // определяет стандартный интерфейс для взаимодействия
                                                                             // децентрализованных приложений (dApps) с ethereum-провайдерами. 
                                                                             // событие, которое срабатывает, когда пользователь в MetaMask (или
                                                                             // другом совместимом кошельке) переключает активный аккаунт или 
                                                                             // отключает кошелёк (в этом случае массив аккаунтов становится 
                                                                             // пустым). подписка на событие происходит с помощью 
                                                                             // window.ethereum.on("accountsChanged", callback); где callback это
                                                                             // функция, которая будет вызвана при срабатывании события. В 
                                                                             // аргументы этой функции передаётся массив новых аккаунтов.
                                                                             // ([newAccount]: [newAccount: string]) деструктуризация берёт первый
                                                                             // элемент массива. типизация указывает, что элемент имеет тип string.
                                                                             // этот код выполняется только в момент, когда MetaMask генерирует
                                                                             // событие accountsChanged (например, пользователь переключает
                                                                             // аккаунт). подписка (через window.ethereum.on) активна до тех пор,
                                                                             // пока не будет отключена (например, 
                                                                             // через window.ethereum.removeListener).
      "accountsChanged",
      async ([newAccount]: [newAccount: string]) => {
        if (newAccount === undefined) {
          return _resetState();
        }

        await _initialize(ethers.getAddress(newAccount));
      }
    );

    window.ethereum.on("chainChanged", ([_networkId]: any) => {
      _resetState();
    });
  };

  const _initialize = async (selectedAccount: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(selectedAccount);

    setCurrentConnection({
      ...currentConnection,                                                     // ...currentConnection копирует все текущие значения полей
                                                                                // CurrentConnectionProps и обновляет все поля которым были 
                                                                                // переданы новые значения. в этом случае использование оператора
                                                                                // spread является избыточным, но оно делает код гибким на случай,
                                                                                // если в будущем будут добавлены новые поля в объект
                                                                                // currentConnection.
      provider,
      signer,
      shop: MusicShop__factory.connect(MUSIC_SHOP_ADDRESS, signer),
    });
  };

  const _checkNetwork = async (): Promise<boolean> => {                          // функция _checkNetwork вызывается в процессе подключения
                                                                                 // кошелька, внутри _connectWallet, чтобы убедиться, что 
                                                                                 // кошелек подключен к правильной сети, в данном случае к hardhat
    const chosenChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chosenChainId === HARDHAT_NETWORK_ID) {
      return true;
    }

    setNetworkError("Please connect to Hardhat network (localhost:8545)!");

    return false;
  };

  const _resetState = () => {                                                     // функция _resetState полностью очищает состояние компонента
                                                                                  // Home и переводит его в "начальное состояние". Это нужно,
                                                                                  // чтобы приложение могло корректно обработать ситуации, такие
                                                                                  // как отключение кошелька, переключение сети или любые другие
                                                                                  // ошибки, требующие сброса. после вызова _resetState состояние
                                                                                  // компонента Home обновляется все значения, связанные с текущим
                                                                                  // подключением и работой кошелька, сбрасываются в начальные.
                                                                                  // при вызове _resetState сбрасываются все состояния, указанные
                                                                                  // внутри этой функции, вне зависимости от того, из какой части
                                                                                  // кода она вызвана
    setNetworkError(undefined);
    setTransactionError(undefined);
    setTxBeingSent(undefined);
    setCurrentBalance(undefined);
    setIsOwner(false);
    setAlbums([]);
    setCurrentConnection({
      provider: undefined,
      signer: undefined,
      shop: undefined,
    });
  };

  const _dismissNetworkError = () => {                                           // удаляет сообщение об ошибке сети. привязана к кнопке "закрыть"
                                                                                 // в компоненте NetworkErrorMessage.
    setNetworkError(undefined);
  };

  const _dismissTransactionError = () => {                                       // удаляет сообщение об ошибке транзакции. вызывается чтобы 
                                                                                 // сбросить состояние и удалить компонент TransactionErrorMessage
                                                                                 // из интерфейса
    setTransactionError(undefined);
  };

  const _getRpcErrorMessage = (error: any): string => {                          // обрабатывает и возвращает читаемое сообщение из ошибки RPC. 
                                                                                 // если сообщение имеет подробности (в data.message), они 
                                                                                 // используются. если подробностей нет, возвращается общее
                                                                                 // сообщение
    console.log(error);
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  };

  const _handleAddAlbum = async (event: FormEvent<HTMLFormElement>) => {         // в функцию передаётся объект события event. внутри 
                                                                                 //_handleAddAlbum объект event который содержит ссылку на форму
                                                                                 // в event.currentTarget и передаёт введённые пользователем данные
                                                                                 // в FormData. event — это объект события, автоматически
                                                                                 // передаваемый в функцию. FormEvent<HTMLFormElement> указывает,
                                                                                 // что событие связано с формой. объекты типа FormEvent имеют
                                                                                 // методы и свойства которые являются стандартной частью 
                                                                                 // интерфейса FormEvent определенного в React

    event.preventDefault();                                                      // без вызова event.preventDefault() форма отправит данные на
                                                                                 // сервер и перезагрузит страницу. эта строка предотвращает
                                                                                 // стандартное поведение браузера при отправке формы (например,
                                                                                 // перезагрузку страницы). это нужно чтобы обработка отправки
                                                                                 // формы выполнялась только в вашем коде, без влияния на поведение
                                                                                 // страницы.

    if (!currentConnection?.shop) {                                              // ?. проверяет, существует ли объект или свойство перед ним и
                                                                                 // только в этом случае пытается получить значение или вызвать
                                                                                 // функцию. проверяет, существует ли подключение к контракту shop
                                                                                 // через объект состояния currentConnection. с технической точки
                                                                                 // зрения, в текущем состоянии интерфейса вероятность попадания в
                                                                                 // это условие минимальна так как при смене сети или аккаунта
                                                                                 // _resetState сбрасывает интерфейс к кнопке "Connect Wallet".
                                                                                 // форма "Add album" становится недоступной. однако это условие
                                                                                 // служит дополнительным уровнем защиты
      return false;
    }

    const shop = currentConnection.shop;                                         // копирует объект контракта shop из состояния currentConnection

    const formData = new FormData(event.currentTarget);                          // new FormData(event.currentTarget) создаёт объект FormData,
                                                                                 // который содержит данные, введённые в форму. event.currentTarget
                                                                                 // это элемент формы, который вызвал событие.
    const title = formData.get("albumTitle")?.toString();
    const price = formData.get("albumPrice")?.toString();
    const quantity = formData.get("albumQty")?.toString();

    if (title && price && quantity) {                                             // условие проверяет, что все значения (title, price, quantity) 
                                                                                  // существуют и не пусты. если хотя бы одно из значений 
                                                                                  // отсутствует, дальнейшая обработка не выполняется
      const uid = ethers.solidityPackedKeccak256(["string"], [title]);

      try {
        const index = await shop.currentIndex();                                  // shop.currentIndex() возвращает текущее значение переменной
                                                                                  // currentIndex из контракта.

        const addTx = await shop.addAlbum(
          uid,
          title,
          BigInt(price),
          BigInt(quantity)
        );

        setTxBeingSent(addTx.hash);                                               // устанавливает состояние `txBeingSent` для отображения
                                                                                  // индикатора выполнения транзакции. если состояние txBeingSent
                                                                                  // содержит значение, то компонент WaitingForTransactionMessage
                                                                                  // отображается в главном компоненте Home. свойство .hash
                                                                                  // формируются только для методов, которые изменяют состояние
                                                                                  // блокчейна. Такие методы называются транзакционными и требуют
                                                                                  // подписания и выполнения транзакции в сети Ethereum. 
                                                                                  // транзакционные методы изменяют состояние блокчейна.
        await addTx.wait();

        setAlbums((albums) => [                                                   // после добавления альбома в контракт, вы вручную обновляете
                                                                                  // состояние albums в React. состояние React (albums) обновляется
                                                                                  // отдельно, чтобы интерфейс был синхронизирован с ожиданиями
                                                                                  // пользователя. новый альбом добавляется в состояние React
                                                                                  // (albums) для немедленного отображения. когда setAlbums
                                                                                  // вызывается, React помечает компонент Home для повторного
                                                                                  // рендеринга.

          ...albums,                                                              // сразу после добавления альбома новый альбом вручную
                                                                                  // добавляется в состояние albums, чтобы пользователь сразу
                                                                                  // увидел изменения.
          {
            index,
            uid,
            title,
            price,
            quantity,
          },
        ]);
      } catch (err) {
        console.error(err);

        setTransactionError(err);
      } finally {                                                                   // когда транзакция завершена (или в случае ошибки), состояние
                                                                                    // txBeingSent сбрасывается в undefined. после этого компонент
                                                                                    // WaitingForTransactionMessage удаляется с экрана
        setTxBeingSent(undefined);
      }                                                                             // блок try используется для выполнения "основного" кода,
                                                                                    // который может потенциально выбросить ошибку. если в блоке
                                                                                    // try происходит ошибка, выполнение кода внутри try
                                                                                    // прерывается, и управление передаётся в блок catch. код в
                                                                                    // блоке finally выполняется всегда, независимо от того,
                                                                                    // произошла ошибка в try или нет.
    }
  };

  const _handleBuyAlbum = async (
    album: AlbumProps,                                                              // объект album имеет тип AlbumProps определенный ранее и 
                                                                                    // содержит информацию о конкретном альбоме, который
                                                                                    // пользователь хочет купить.

    event: React.MouseEvent<HTMLButtonElement>                                      // event предоставляет доступ к дополнительным данным о
                                                                                    // событии клика. например, можно будет использовать
                                                                                    // event.target для получения динамических данных из атрибутов
                                                                                    // кнопки. так же это обеспечивает гибкость на будущее. если 
                                                                                    // позже изменить кнопку на другую, например, <a> (ссылку),
                                                                                    // или включите её в форму, использование 
                                                                                    // event.preventDefault() гарантирует, что стандартное 
                                                                                    // поведение не нарушит работу функции.
  ) => {
    event.preventDefault();

    if (!currentConnection?.shop) {
      return false;
    }

    try {
      const buyTx = await currentConnection.shop.buy(album.index, { value: album.price });
                                                                                     // в методе buy контракта проверяется, достаточно ли
                                                                                     // переданных средств (msg.value).состояние альбома (quantity)
                                                                                     // уменьшается. транзакция записывается в блокчейн. метод 
                                                                                     // возвращает объект TransactionResponse, содержащий 
                                                                                     // информацию о транзакции (включая hash)
      setTxBeingSent(buyTx.hash);
      await buyTx.wait();

      setAlbums(
        albums.map((a) => {                                                           // обходит текущий массив альбомов. (a) — это текущий элемент 
                                                                                      // массива albums, который передаётся автоматически в функцию 
                                                                                      // обратного вызова метода .map(). для каждого элемента
                                                                                      // массива albums выполняется функция (a) => { ... }.
          if (a.index === album.index) {
            album.quantity =
              BigInt(album.quantity) - BigInt(1);                                     // для альбома, который был куплен (a.index === album.index), 
                                                                                      // уменьшает quantity на 1

            return album;                                                             // остальные альбомы остаются без изменений
          } else {
            return a;
          }
        })
      );
    } catch (err) {
      console.error(err);

      setTransactionError(err);
    } finally {
      setTxBeingSent(undefined);
    }
  };

  const availableAlbums = () => {                                          // функция availableAlbums отвечает за формирование списка доступных 
                                                                           // альбомов для отображения в пользовательском интерфейсе. цель функции
                                                                           // availableAlbums пройти по массиву albums и сформировать массив
                                                                           // JSX-элементов <li>, каждый из которых представляет альбом. метод
                                                                           // .map() создаёт массив JSX-элементов. каждый <li> содержит информацию 
                                                                           // об альбоме (название, цену, количество). если альбом доступен
                                                                           // (quantity > 0), отображается кнопка "Buy 1 copy". функция возвращает
                                                                           // массив JSX-элементов, которые затем рендерятся в компоненте Home.

    const albumsList = albums.map((album) => {                             // для каждого элемента массива вызывает функцию обратного вызова
                                                                           // (album) => { ... }. в результате создаёт новый массив, где каждый
                                                                           // элемент — это JSX-элемент <li> для конкретного альбома. входящие
                                                                           // данные: каждый элемент массива передаётся в функцию callback. 
                                                                           // обработка: callback возвращает результат обработки текущего элемента. 
                                                                           // результат: .map() создаёт новый массив из значений, которые были
                                                                           // возвращены callback.
      return (
        <li key={album.uid}>                                               {/*<li> - это HTML-элемент "List Item" (элемент списка). это как один 
                                                                              пункт в списке. в HTML/JSX списки всегда состоят из <ul> (Unordered
                                                                              List) - сам контейнер списка и <li> - отдельные элементы внутри этого
                                                                              списка. React требует уникальный key для каждого элемента списка. в
                                                                              данном случае используется уникальный идентификатор альбома album.uid 
                                                                              key={album.uid} */}
                                                                           {/*<> </> - это React Fragment, пустой контейнер, который не создает
                                                                              дополнительный DOM-элемент. Fragment (<> </>) группирует элементы,
                                                                              но не создает дополнительный HTML-элемент */}
          <>
            {album.title} (#{album.index.toString()})<br />                {/*отображает название альбома (album.title) и его индекс (album.index).
                                                                              album.index.toString() индекс конвертируется в строку, чтобы быть
                                                                              отображённым в JSX. например это вернёт строку rap_album (#0) */}

            Price: {album.price.toString()}                                {/*цена альбома. например это вернёт строку Price: 25 */}
            <br />
            Qty: {album.quantity.toString()}                               
            <br />
            {/*если условие ниже истинно, то отображается кнопка с текстом "Buy 1 copy". onClick={(e) => _handleBuyAlbum(album, e)} привязывает
               обработчик клика к кнопке. при нажатии вызывается функция _handleBuyAlbum с аргументами album — данные текущего альбома и e — 
               событие клика. в _handleBuyAlbum событие используется для предотвращения стандартного поведения кнопки (если это необходимо). */}
            {BigInt(album.quantity) > BigInt(0) && (
              <button onClick={(e) => _handleBuyAlbum(album, e)}>                   
                Buy 1 copy
              </button>
            )}
          </>
        </li>
      );
    });

    return albumsList;                                                      // возвращает массив, состоящий из JSX-элементов <li> для каждого
                                                                            // альбома. этот массив будет использоваться для рендеринга списка
                                                                            // альбомов в компоненте. элементы <li> временно сохраняются в 
                                                                            // переменной albumsList внутри функции availableAlbums. дальше
                                                                            // переменная albumsList возвращается функцией availableAlbums. список
                                                                            // <li> элементов вставляется в тег <ul> в компоненте Home и
                                                                            // отображается на странице.
  };

  return (
    <main>                                                                       {/*при первом рендере все состояния созданные с помощью useState
                                                                                    инициализируется. (например, networkError = undefined).
                                                                                    React выполняет JSX в функции Home и проверяет все условия
                                                                                    внутри return. при вызове setNetworkError в useState 
                                                                                    сохраняется новое значение и инициируется повторный
                                                                                    рендеринг компонента Home. Все условия в JSX проверяются
                                                                                    заново и так как networkError теперь содержит значение,
                                                                                    условие networkError && ... становится истинным, и блок
                                                                                    отображается. React проверяет условия в блоке JSX только при
                                                                                    рендеринге компонента. эти проверки не выполняются постоянно,
                                                                                    а срабатывают при изменении состояния */}
      {networkError && (
        <NetworkErrorMessage message={networkError} dismiss={_dismissNetworkError} />
      )}                                                                         {/*если состояние networkError содержит значение (строку ошибки),
                                                                                    то компонент NetworkErrorMessage отображается */}

      {!currentConnection?.signer && (
        <ConnectWallet
          connectWallet={_connectWallet}
          networkError={networkError}
          dismiss={_dismissNetworkError}
        />
      )}                                                                         {/*кнопка подключения кошелька. проверяет, есть ли подписывающий
                                                                                    кошелёк (свойство signer) в текущем подключении. если кошелёк
                                                                                    отсутствует, отображается компонент ConnectWallet. компонент
                                                                                    ConnectWallet принимает три пропса:
                                                                                    connectWallet={_connectWallet} функция для подключения
                                                                                    кошелька, networkError={networkError} текущая ошибка сети и
                                                                                    dismiss={_dismissNetworkError} обработчик для скрытия ошибки
                                                                                    сети. В родительском компоненте Home определяются состояни и
                                                                                    функции, эти данные передаются в ConnectWallet как пропсы. В
                                                                                    свою очередь в дочернем компоненте пропсы принимаются как 
                                                                                    аргументы. используются внутри компонента для отображения
                                                                                    интерфейса (например, сообщения об ошибке) и обработки событий
                                                                                    (например, нажатие кнопки "Connect wallet"). */}

      {currentConnection?.signer && (
        <p>Your address: {currentConnection.signer.address}</p>
      )}                                                                         {/*отображает адрес текущего подписывающего кошелька */}

      {txBeingSent && <WaitingForTransactionMessage txHash={txBeingSent} />}     {/*проверяет, есть ли хэш текущей выполняемой транзакции
                                                                                    (txBeingSent). если значение есть, отображается компонент
                                                                                    WaitingForTransactionMessage. компонент
                                                                                    WaitingForTransactionMessage принимает один пропс 
                                                                                    txHash={txBeingSent},который является хэшем транзакции для
                                                                                    отображения. */}

      {transactionError && (
        <TransactionErrorMessage
          message={_getRpcErrorMessage(transactionError)}
          dismiss={_dismissTransactionError}
        />
      )}                                                                          {/*отображает сообщение об ошибке транзакции. */}

      {currentBalance && (
        <p>Your balance: {ethers.formatEther(currentBalance)} ETH</p>
      )}                                                                          {/*отображает баланс текущего подключенного аккаунта. баланс
                                                                                     текущего пользователя вычисляется и сохраняется в состоянии
                                                                                     currentBalance с помощью функции setCurrentBalance. это
                                                                                     происходит в блоке useEffect, который срабатывает после
                                                                                     каждого рендеринга, если изменилось состояние
                                                                                     currentConnection или txBeingSent */}

      {albums.length > 0 && <ul>{availableAlbums()}</ul>}                         {/*проверяет, есть ли альбомы в массиве albums. если альбомы есть,
                                                                                     отображается элемент <ul>. вызывает функцию availableAlbums,
                                                                                     которая возвращает массив JSX-элементов <li>. эти элементы
                                                                                     рендерятся внутри тега <ul> */}

      {isOwner && !txBeingSent && (
        <form onSubmit={_handleAddAlbum}>                                 
          <h2>Add album</h2>

          <label>
            Title:
            <input type="text" name="albumTitle" />
          </label>

          <label>
            Price:
            <input type="text" name="albumPrice" />
          </label>

          <label>
            Qty:
            <input type="text" name="albumQty" />
          </label>

          <input type="submit" value="Add!" />
        </form>
      )}                                                                            {/*форма добавления альбома. проверяет два условия: 
                                                                                       пользователь — владелец магазина (isOwner) и нет текущей
                                                                                       выполняемой транзакции (!txBeingSent). если оба условия
                                                                                       выполнены, отображается форма. отправляет данные о новом
                                                                                       альбоме через функцию _handleAddAlbum. данные из формы
                                                                                       отправляются в функцию _handleAddAlbum с помощью объекта
                                                                                       FormData, который автоматически собирает все данные,
                                                                                       введённые в полях формы. этот объект создаётся внутри
                                                                                       функции _handleAddAlbum при её вызове. все поля формы
                                                                                       идентифицируются по их атрибуту name и далее все данные
                                                                                       собираются объектом FormData при вызове _handleAddAlbum.
                                                                                       после этого в функции _handleAddAlbum можно явно извлечь
                                                                                       данные из FormData с помощью метода .get(), чтобы отправить
                                                                                       их в контракт. например:
                                                                                       const title = formData.get("albumTitle")?.toString(); */}
    </main>
  );
}
