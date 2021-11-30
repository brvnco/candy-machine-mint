import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const {
        candyMachine,
        goLiveDate,
        itemsAvailable,
        itemsRemaining,
        itemsRedeemed,
      } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      setItemsAvailable(itemsAvailable);
      setItemsRemaining(itemsRemaining);
      setItemsRedeemed(itemsRedeemed);

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  return (
    <main>
      {/*
      {wallet && (
        <p>Wallet {shortenAddress(wallet.publicKey.toBase58() || "")}</p>
      )}

      {wallet && <p>Balance: {(balance || 0).toLocaleString()} SOL</p>}

      {wallet && <p>Total Available: {itemsAvailable}</p>}

      {wallet && <p>Redeemed: {itemsRedeemed}</p>}

      {wallet && <p>Remaining: {itemsRemaining}</p>}

      <MintContainer>
        {!wallet ? (
          <ConnectButton>Connect Wallet</ConnectButton>
        ) : (
          <MintButton
            disabled={isSoldOut || isMinting || !isActive}
            onClick={onMint}
            variant="contained"
          >
            {isSoldOut ? (
              "SOLD OUT"
            ) : isActive ? (
              isMinting ? (
                <CircularProgress />
              ) : (
                "MINT"
              )
            ) : (
              <Countdown
                date={startDate}
                onMount={({ completed }) => completed && setIsActive(true)}
                onComplete={() => setIsActive(true)}
                renderer={renderCounter}
              />
            )}
          </MintButton>
        )}
      </MintContainer>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
            */}
              
      <nav>
            <img src="logo.svg"/>
            <div className="socials">
              <a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_218_51)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M19.54 0C20.896 0 22 1.104 22 2.472V24L19.42 21.72L17.968 20.376L16.432 18.948L17.068 21.168H3.46C2.104 21.168 1 20.064 1 18.696V2.472C1 1.104 2.104 0 3.46 0H19.54V0ZM14.908 15.672C17.56 15.588 18.58 13.848 18.58 13.848C18.58 9.984 16.852 6.852 16.852 6.852C15.124 5.556 13.48 5.592 13.48 5.592L13.312 5.784C15.352 6.408 16.3 7.308 16.3 7.308C15.052 6.624 13.828 6.288 12.688 6.156C11.824 6.06 10.996 6.084 10.264 6.18L10.06 6.204C9.64 6.24 8.62 6.396 7.336 6.96C6.892 7.164 6.628 7.308 6.628 7.308C6.628 7.308 7.624 6.36 9.784 5.736L9.664 5.592C9.664 5.592 8.02 5.556 6.292 6.852C6.292 6.852 4.564 9.984 4.564 13.848C4.564 13.848 5.572 15.588 8.224 15.672C8.224 15.672 8.668 15.132 9.028 14.676C7.504 14.22 6.928 13.26 6.928 13.26L7.264 13.464L7.312 13.5L7.359 13.527L7.373 13.533L7.42 13.56C7.72 13.728 8.02 13.86 8.296 13.968C8.788 14.16 9.376 14.352 10.06 14.484C10.96 14.652 12.016 14.712 13.168 14.496C13.732 14.4 14.308 14.232 14.908 13.98C15.328 13.824 15.796 13.596 16.288 13.272C16.288 13.272 15.688 14.256 14.116 14.7C14.476 15.156 14.908 15.672 14.908 15.672ZM9.328 10.068C8.644 10.068 8.104 10.668 8.104 11.4C8.104 12.132 8.656 12.732 9.328 12.732C10.012 12.732 10.552 12.132 10.552 11.4C10.564 10.668 10.012 10.068 9.328 10.068ZM13.708 10.068C13.024 10.068 12.484 10.668 12.484 11.4C12.484 12.132 13.036 12.732 13.708 12.732C14.392 12.732 14.932 12.132 14.932 11.4C14.932 10.668 14.392 10.068 13.708 10.068Z"/>
</g>
<defs>
<clipPath id="clip0_218_51">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg></a>
              <a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_218_49)">
<path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0V0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12C5.838 15.403 8.597 18.163 12 18.163C15.403 18.163 18.162 15.404 18.162 12C18.162 8.597 15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C17.61 4.155 16.965 4.8 16.965 5.595C16.965 6.39 17.61 7.035 18.406 7.035C19.201 7.035 19.845 6.39 19.845 5.595C19.845 4.8 19.201 4.155 18.406 4.155Z"/>
</g>
<defs>
<clipPath id="clip0_218_49">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
</a>
              <a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_218_47)">
<path d="M24 4.55705C23.117 4.94905 22.168 5.21305 21.172 5.33205C22.189 4.72305 22.97 3.75805 23.337 2.60805C22.386 3.17205 21.332 3.58205 20.21 3.80305C19.313 2.84605 18.032 2.24805 16.616 2.24805C13.437 2.24805 11.101 5.21405 11.819 8.29305C7.728 8.08805 4.1 6.12805 1.671 3.14905C0.381 5.36205 1.002 8.25705 3.194 9.72305C2.388 9.69705 1.628 9.47605 0.965 9.10705C0.911 11.388 2.546 13.522 4.914 13.997C4.221 14.185 3.462 14.229 2.69 14.081C3.316 16.037 5.134 17.46 7.29 17.5C5.22 19.123 2.612 19.848 0 19.54C2.179 20.937 4.768 21.752 7.548 21.752C16.69 21.752 21.855 14.031 21.543 7.10605C22.505 6.41105 23.34 5.54405 24 4.55705Z"/>
</g>
<defs>
<clipPath id="clip0_218_47">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
</a>
            </div>
      </nav>

      <section className="content">

      <div className="text">
        <div className="title">
        <h1>Orby</h1>
        <h2>NFT</h2>
        </div>
        <p>Years before the big bang small orb-like objects wandered around the orbit of the galaxy, without any designated destination. All hope was lost, until recent research shined a new light. Confidence came back into the galaxy. What looked like a sphere-like object evolved into one of the universe’s last surviving species. </p>

<p><span className="highlight">Orby was discovered. </span></p>
<p>
Without spoiling too much intel, we can tell that each orby will be unique, having its own material and faction properties and their own place inside the orby-verse.
  </p>
  <p>
In this evolving phase, the outer shell is created in combination with more added features.
</p>
<p>
<span className="highlight">
Excited yet?
</span>
</p>

      </div>

      <div className="orby">
          <img src="assets/orby_1.png" alt="orby planet mmmnice" />  

          <div className="factions2">
      <svg width="39" height="34" viewBox="0 0 39 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.766601 17.0097L17.4716 15.679L10.2715 0.546657L19.7765 14.3483L29.2814 0.546656L22.0813 15.679L38.7863 17.0097L22.0813 18.3404L29.2814 33.4727L19.7765 19.6711L10.2715 33.4727L17.4716 18.3404L0.766601 17.0097Z"/>
</svg>
<svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.095 19.2837C-0.604925 17.3764 -0.604925 13.3715 2.095 11.4642V11.4642C3.44545 10.5102 4.20796 8.92678 4.11185 7.27614V7.27614C3.91969 3.97605 7.05081 1.47906 10.2254 2.40074V2.40074C11.8133 2.86175 13.5266 2.47069 14.7572 1.36638V1.36638C17.2175 -0.841426 21.122 0.0497373 22.3807 3.10639V3.10639C23.0103 4.63527 24.3843 5.731 26.0149 6.0046V6.0046C29.275 6.5516 31.0127 10.1598 29.4077 13.0498V13.0498C28.6049 14.4952 28.6049 16.2526 29.4077 17.6981V17.6981C31.0127 20.588 29.275 24.1963 26.0149 24.7433V24.7433C24.3843 25.0169 23.0103 26.1126 22.3807 27.6415V27.6415C21.122 30.6981 17.2175 31.5893 14.7572 29.3815V29.3815C13.5266 28.2772 11.8133 27.8861 10.2254 28.3471V28.3471C7.05081 29.2688 3.91969 26.7718 4.11185 23.4717V23.4717C4.20796 21.8211 3.44545 20.2377 2.095 19.2837V19.2837Z"/>
</svg>
<svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.964843 19.7382L14.7323 14.4958L19.9747 0.728336L25.2171 14.4958L38.9846 19.7382L25.2171 24.9806L19.9747 38.748L14.7323 24.9806L0.964843 19.7382Z"/>
</svg>
<svg width="49" height="50" viewBox="0 0 49 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M-1.0699e-06 25.1964L19.6881 24.1786L2.1161 15.2409L20.5161 22.319L8.09851 7.00685L22.0288 20.957L16.9128 1.91791L23.9648 20.3279L27.0349 0.854033L25.9892 20.5407L36.7147 3.99917L27.752 21.5585L44.2783 10.8095L28.9485 23.2053L48.418 20.1075L29.3717 25.1964L48.418 30.2853L28.9485 27.1875L44.2783 39.5833L27.752 28.8343L36.7147 46.3936L25.9892 29.8521L27.0349 49.5388L23.9648 30.0649L16.9128 48.4749L22.0288 29.4358L8.09851 43.3859L20.5161 28.0738L2.1161 35.1519L19.6881 26.2142L-1.0699e-06 25.1964Z"/>
</svg>
<svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.164062 19.4667L12.4943 16.25L7.32146 4.6042L17.5242 12.2387L23.404 0.933467L23.7964 13.6703L36.3012 11.2186L26.5878 19.4667L36.3012 27.7148L23.7964 25.2631L23.404 37.9999L17.5242 26.6947L7.32147 34.3292L12.4943 22.6835L0.164062 19.4667Z"/>
</svg>


      </div>
      </div>

      <div className="factions">
      <svg width="39" height="34" viewBox="0 0 39 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.766601 17.0097L17.4716 15.679L10.2715 0.546657L19.7765 14.3483L29.2814 0.546656L22.0813 15.679L38.7863 17.0097L22.0813 18.3404L29.2814 33.4727L19.7765 19.6711L10.2715 33.4727L17.4716 18.3404L0.766601 17.0097Z"/>
</svg>
<svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.095 19.2837C-0.604925 17.3764 -0.604925 13.3715 2.095 11.4642V11.4642C3.44545 10.5102 4.20796 8.92678 4.11185 7.27614V7.27614C3.91969 3.97605 7.05081 1.47906 10.2254 2.40074V2.40074C11.8133 2.86175 13.5266 2.47069 14.7572 1.36638V1.36638C17.2175 -0.841426 21.122 0.0497373 22.3807 3.10639V3.10639C23.0103 4.63527 24.3843 5.731 26.0149 6.0046V6.0046C29.275 6.5516 31.0127 10.1598 29.4077 13.0498V13.0498C28.6049 14.4952 28.6049 16.2526 29.4077 17.6981V17.6981C31.0127 20.588 29.275 24.1963 26.0149 24.7433V24.7433C24.3843 25.0169 23.0103 26.1126 22.3807 27.6415V27.6415C21.122 30.6981 17.2175 31.5893 14.7572 29.3815V29.3815C13.5266 28.2772 11.8133 27.8861 10.2254 28.3471V28.3471C7.05081 29.2688 3.91969 26.7718 4.11185 23.4717V23.4717C4.20796 21.8211 3.44545 20.2377 2.095 19.2837V19.2837Z"/>
</svg>
<svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.964843 19.7382L14.7323 14.4958L19.9747 0.728336L25.2171 14.4958L38.9846 19.7382L25.2171 24.9806L19.9747 38.748L14.7323 24.9806L0.964843 19.7382Z"/>
</svg>
<svg width="49" height="50" viewBox="0 0 49 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M-1.0699e-06 25.1964L19.6881 24.1786L2.1161 15.2409L20.5161 22.319L8.09851 7.00685L22.0288 20.957L16.9128 1.91791L23.9648 20.3279L27.0349 0.854033L25.9892 20.5407L36.7147 3.99917L27.752 21.5585L44.2783 10.8095L28.9485 23.2053L48.418 20.1075L29.3717 25.1964L48.418 30.2853L28.9485 27.1875L44.2783 39.5833L27.752 28.8343L36.7147 46.3936L25.9892 29.8521L27.0349 49.5388L23.9648 30.0649L16.9128 48.4749L22.0288 29.4358L8.09851 43.3859L20.5161 28.0738L2.1161 35.1519L19.6881 26.2142L-1.0699e-06 25.1964Z"/>
</svg>
<svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.164062 19.4667L12.4943 16.25L7.32146 4.6042L17.5242 12.2387L23.404 0.933467L23.7964 13.6703L36.3012 11.2186L26.5878 19.4667L36.3012 27.7148L23.7964 25.2631L23.404 37.9999L17.5242 26.6947L7.32147 34.3292L12.4943 22.6835L0.164062 19.4667Z"/>
</svg>


      </div>

      </section>

      
      
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
