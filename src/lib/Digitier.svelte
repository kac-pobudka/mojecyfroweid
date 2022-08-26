<script lang="ts">
  // import backend from "nimview";
  import type { DigiBackend } from "../common/types";
  import { newSodiumBackend } from "../sodium_backend";

  const DEBOUNCE = 1_000;
  let backend: DigiBackend;
  newSodiumBackend().then((b) => (backend = b));

  let randomText = "";
  let mnemonics = "";
  let pubkey = "";
  let toSign = "";
  let signed = "";
  let keyToVerify = "";
  let toVerify = "";
  let verified = "";

  const debounce = (t: number, f: () => void) => {
    let timer: any;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(f, t);
    };
  };

  const debText = debounce(DEBOUNCE, async () => {
    mnemonics = await backend.randomToMnemonic(randomText);
    await newMnemonics();
  });

  const newMnemonics = async () => {
    pubkey = await backend.mnemonicToPubkey(mnemonics);
    signed = "";
  };

  const debMnemonics = debounce(DEBOUNCE, newMnemonics);

  const debToSign = debounce(DEBOUNCE, async () => {
    signed = await backend.signMessage(mnemonics, toSign);
  });

  const debVerify = debounce(DEBOUNCE, async () => {
    verified = "";
    verified = await backend.verifyMessage(keyToVerify, toVerify);
  });

  const copy = (evt: Event) => {
    evt.preventDefault();
    let target = (evt.target as Element).getAttribute("data-copy-target");
    if (target) {
      let el = document.querySelector(target) as HTMLInputElement;
      el.select();
      document.execCommand("copy");
    }
  };

  const buttonClass = "btn btn-secondary input-action";

  const generateRandom = async (evt: Event) => {
    evt.preventDefault();
    randomText = await backend.generateRandom(64);
    debText();
  };
</script>

<div class="container" lang="pl">
  <div class="navbar">
    <div class="navbar-inner">
      <a class="brand" href={"#"}>#MojeCyfroweID</a>
    </div>
  </div>
  <form>
    <div class="form-group">
      <label for="randomValueInput"
        >Źródło losowości (np. karty albo wygeneruj)</label
      >
      <textarea
        id="randomValueInput"
        class="form-control"
        rows="4"
        spellcheck="false"
        bind:value={randomText}
        placeholder="H9 SQ C3 ..."
        on:input={debText}
      />
      <button
        class={buttonClass}
        on:click={generateRandom}
        data-copy-target="#phrase">wygeneruj</button
      >
    </div>
    <div class="form-group">
      <label for="phrase">Prywatny ciąg słów</label>
      <textarea
        id="phrase"
        class="form-control"
        rows="4"
        bind:value={mnemonics}
        placeholder="iść grupa drzewo ..."
        on:input={debMnemonics}
      />
      <button class={buttonClass} on:click={copy} data-copy-target="#phrase"
        >kopiuj</button
      >
      <small class="form-text text-muted">Możesz dopisać własne słowa</small>
    </div>
    <div class="form-group">
      <label for="pubkey">Publiczny adres</label>
      <input
        id="pubkey"
        class="form-control"
        type="text"
        bind:value={pubkey}
        placeholder="1Qew9Fvd..."
        readonly
      />
      <button class={buttonClass} on:click={copy} data-copy-target="#pubkey"
        >kopiuj</button
      >
    </div>
    <div class="form-group">
      <label for="toSign">Wiadomość do podpisania</label>
      <textarea
        id="toSign"
        class="form-control"
        rows="4"
        bind:value={toSign}
        placeholder="to jestem ja, ..."
        on:input={debToSign}
      />
      <textarea
        id="signed"
        class="form-control"
        rows="4"
        readonly
        bind:value={signed}
      />
      <button class={buttonClass} on:click={copy} data-copy-target="#signed"
        >kopiuj</button
      >
    </div>
    <div class="form-group">
      <label for="keyToVerify">Adres do weryfikacji</label>
      <input
        id="keyToVerify"
        class="form-control"
        type="text"
        spellcheck="false"
        bind:value={keyToVerify}
        placeholder="1Qew9Fvd..."
        on:input={debVerify}
      />
      <label for="toVerify">Wiadomość do weryfikacji</label>
      <textarea
        id="toVerify"
        class="form-control"
        rows="4"
        spellcheck="false"
        placeholder="CTr6nxysEuWoo..."
        bind:value={toVerify}
        on:input={debVerify}
      />
      <label for="verified">Zweryfikowana</label>
      <textarea
        id="verified"
        class="form-control"
        type="text"
        rows="4"
        readonly
        bind:value={verified}
      />
      <button class={buttonClass} on:click={copy} data-copy-target="#verified"
        >kopiuj</button
      >
    </div>
  </form>
</div>

<style>
  .container {
    min-width: 32em;
  }
  .btn.input-action {
    float: right;
  }
  [readonly] {
    background-color: lightgrey;
  }
</style>
