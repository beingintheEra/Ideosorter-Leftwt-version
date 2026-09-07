let ideologies = {};

async function loadIdeologies() {
  try {
    const res = await fetch("./ideologies.json");
    ideologies = await res.json();
  } catch {
    ideologies = {};
  }
}

const state = {
  history: [],
  currentQuestion: null
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadIdeologies();
  renderWelcome();
});

function $(selector) {
  return document.querySelector(selector);
}

function clearApp() {
  const app = $("#app");
  app.innerHTML = "";
  return app;
}

function showSubtitle() {
  const subtitle = $("#subtitle");
  if (subtitle) subtitle.style.display = "";
}

function hideSubtitle() {
  const subtitle = $("#subtitle");
  if (subtitle) subtitle.style.display = "none";
}

function renderWelcome() {
  showSubtitle();

  const app = clearApp();

  const wrap = document.createElement("div");
  wrap.className = "welcome";

  const startBtn = makeButton("Start", () => {
    state.history = [];
    hideSubtitle();
    q_privateProperty();
  });

  wrap.appendChild(startBtn);
  app.appendChild(wrap);
}

function renderQuiz(questionText, choices, backFn) {
  hideSubtitle();

  const app = clearApp();

  const wrap = document.createElement("div");
  wrap.className = "quiz";

  const h1 = document.createElement("h1");
  h1.textContent = questionText;

  const answersWrap = document.createElement("div");
  answersWrap.style.marginTop = "24px";

  for (const choice of choices) {
    answersWrap.appendChild(makeButton(choice.label, choice.onClick));
  }

  wrap.appendChild(h1);
  wrap.appendChild(answersWrap);

  if (backFn) {
    const backBtn = makeButton("Back", backFn);
    backBtn.style.marginTop = "32px";
    wrap.appendChild(backBtn);
  }

  app.appendChild(wrap);
}

function renderResult(ideologyName) {
  hideSubtitle();

  const app = clearApp();

  const wrap = document.createElement("div");
  wrap.className = "result";

  const h1 = document.createElement("h1");
  h1.textContent = ideologyName;

  const flagWrap = document.createElement("div");
  flagWrap.className = "flag-wrap";

  const flagImg = document.createElement("img");
  flagImg.className = "result-flag";
  flagImg.alt = `${ideologyName} flag`;
  flagImg.src = `./assets/flags/${encodeURIComponent(ideologyName)}.svg`;
  flagImg.onerror = () => {
    flagImg.onerror = null;
    flagImg.src = "./assets/flags/null.svg";
  };

  flagWrap.appendChild(flagImg);

  const entry = ideologies[ideologyName];
  const quoteStr = entry?.[0]?.trim() || "";
  const authorStr = entry?.[1]?.trim() || "";

  const quoteBox = document.createElement("div");
  quoteBox.className = "quote-box";

  const quoteText = document.createElement("div");
  quoteText.className = "quote-text";
  quoteText.textContent = quoteStr ? `“${quoteStr}”` : "No quote found.";

  const quoteAuthor = document.createElement("div");
  quoteAuthor.className = "quote-author";
  quoteAuthor.textContent = authorStr ? `— ${authorStr}` : "";

  quoteBox.appendChild(quoteText);
  quoteBox.appendChild(quoteAuthor);

  const restartBtn = makeButton("Restart", renderWelcome);

  let backBtn = null;
  if (state.history.length > 0) {
    backBtn = makeButton("Back", () => {
      const last = state.history.pop();
      if (last) last();
    });
  }

  wrap.appendChild(h1);
  wrap.appendChild(flagWrap);
  wrap.appendChild(quoteBox);

  if (backBtn) wrap.appendChild(backBtn);
  wrap.appendChild(restartBtn);

  app.appendChild(wrap);
}

function q(prev, questionText,
           b1, n1,
           b2, n2,
           b3, n3,
           b4, n4,
           b5, n5) {
  state.currentQuestion = q.caller || null;

  const choices = [];

  function addChoice(label, next) {
    if (!label) return;

    choices.push({
      label,
      onClick: () => {
        if (state.currentQuestion) state.history.push(state.currentQuestion);
        if (typeof next === "function") next();
      }
    });
  }

  addChoice(b1, n1);
  addChoice(b2, n2);
  addChoice(b3, n3);
  addChoice(b4, n4);
  addChoice(b5, n5);

  let backFn = null;

  if (prev === "") {
    backFn = renderWelcome;
  } else if (typeof prev === "function") {
    backFn = () => prev();
  } else if (state.history.length > 0) {
    backFn = () => {
      const last = state.history.pop();
      if (last) last();
    };
  }

  renderQuiz(questionText, choices, backFn);
}

function r(_fromQuestionFn, ideologyName) {
  renderResult(ideologyName);
}

/* START OF QUIZ */

function q_privateProperty() {
    q("", "Should private property exist?", "Yes", q_constitution, "No", q_markets)
}

/* ANTI-PRIVATE PROPERTY TREE */

function q_markets() {
  q("", "Should goods be distributed through the market?", "Yes", q_authMarkSoc, "No", q_communism);
}

function q_authMarkSoc() {
  q(q_markets, "Should the state be governed by a single, central party?", "Yes", q_lange, "No", q_guilds, "The state should not exist", q_mutual);
}

function q_lange() {
  q(q_authMarkSoc, "Should central planners allocate resources and industry?", "Yes", () => r(q_lange, "Langean Socialism"), "No", () => r(q_lange, "Titoism"));
}

function q_guilds() {
  q(q_authMarkSoc, "Should public services be competitive?", "Yes", () => r(q_guilds, "Market Socialism"), "No", () => r(q_guilds, "Guild Socialism"));
}

function q_mutual() {
  q(q_authMarkSoc, "Should the economy be based on mutual credit?", "Yes", q_ethnic, "No", () => r(q_mutual, "Market Anarchism"));
}

function q_ethnic() {
  q(q_mutual, "Should communities be ethnically homogenous?", "Yes", () => r(q_ethnic, "National Anarchism"), "No", () => r(q_ethnic, "Tuckerite Mutualism"));
}

function q_communism() {
  q(q_markets, "Should we reach a classless, stateless, moneyless society?", "Yes", q_religion, "No", q_weed);
}

function q_religion() {
  q(q_communism, "Is the motive for my politics religious?", "Yes", q_whatreligion, "No", q_dotp);
}

function q_whatreligion() {
  q(q_religion, "What religion drives your ideology?", "Christianity", q_anarchochrist, "Islam", q_anarchoislam, "Judaism", q_anarchojewish, "Confucianism", q_anarchoconfucian);
}

function q_anarchochrist() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchochrist, "Christian Anarchism"), "No", () => r(q_anarchochrist, "Liberation Theology"));
}

function q_anarchoislam() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchoislam, "Islamic Anarcho-Communism"), "No", () => r(q_anarchoislam, "Islamic Socialism"));
}

function q_anarchojewish() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchojewish, "Jewish Anarcho-Communism"), "No", () => r(q_anarchojewish, "Labour Zionism"));
}

function q_anarchoconfucian() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchoconfucian, "Confucian Anarcho-Communism"), "No", () => r(q_anarchoconfucian, "Confucian Socialism"));
}

function q_dotp() {
  q(q_religion, "Is a Dictatorship of the Proletariat necessary to achieve communism?", "Yes", q_workerscouncils, "No", q_communization);
}

function q_workerscouncils() {
  q(q_dotp, "Will the Revolution be organized via spontaneous Workers Councils?", "Yes", q_massparty, "No", q_demCent);
}

function q_massparty() {
  q(q_workerscouncils, "Should there be a party to organize spontaneous workers' councils?", "Yes", q_electoralism, "No", q_insurrectionaryorganization);
}

function q_electoralism() {
  q(q_massparty, "Should we use electoral politics to develop class consciousness among workers?", "Yes", () => r(q_electoralism, "Spartacism"), "No", q_partyElites);
}

function q_insurrectionaryorganization() {
  q(q_massparty, "Is an insurrectionary organization is necessary for the struggle against capitalism?", "Yes", q_maospontex, "No", q_situationism);
}

function q_situationism() {
  q(q_insurrectionaryorganization, "Should be the Dictatorship of the Proletariat be an antistate one?", "Yes", () => r(q_situationism, "Situationism"), "No", () => r(q_situationism, "Libertarian Marxism"));
}

function q_maospontex() {
  q(q_insurrectionaryorganization, "Should we accept the Chinese Cultural Revolution as a role model for our struggle?", "Yes", () => r(q_maospontex, "Mao-Spontex"), "No", q_areasofstruggle);
}

function q_areasofstruggle() {
  q(q_maospontex, "Are ecological and social contradictions as important as class contradictions?", "Yes", () => r(q_areasofstruggle, "Post-Autonomism"), "No", () => r(q_areasofstruggle, "Autonomism"));
}

function q_demCent() {
  q(q_workerscouncils, "Should proletarian organization be based on democratic centralism?", "Yes", q_proletarianculture, "No", q_organic);
}

function q_organic() {
  q(q_demCent, "Should the Proletarian organization be based upon organic centralism?", "Yes", () => r(q_organic, "Italian Left-Communism (Programma)"), "No", q_reform, "The revolution does not have an organizational model", () => r(q_organic, "Communization (Marxist)"));
}

function q_reform() {
  q(q_organic, "Should we reform capitalism on the short term?", "Yes", () => r(q_reform, "Classical Social Democracy"), "No", () => r(q_reform, "De Leonism"));
}

function q_proletarianculture() {
  q(q_demCent, "Is the purpose of this proletarian organization not only to develop class consciousness among the proletariat but also to create a new proletarian identity and culture?", "Yes", () => r(q_proletarianculture, "Vperedism"), "No", q_stalinCope);
}

function q_stalinCope() {
  q(q_demCent, "Can socialism be built up in one country?", "Yes", q_nepTime, "No", q_natLib);
}

function q_natLib() {
  q(q_stalinCope, "Do you support national liberation in contemporary society?", "Yes", q_dws, "No", () => r(q_natLib, "Italian Left-Communism (Battaglia)"));
}

function q_dws() {
  q(q_natLib, "Do you subscribe to the theory of the degenerated workers state?", "Yes", () => r(q_dws, "Orthodox Trotskyism"), "No", q_workersDemocracyStalin);
}

function q_workersDemocracyStalin() {
  q(q_dws, "Did the working class lose democratic control over the Soviet state under Stalin?", "Yes", () => r(q_workersDemocracyStalin, "Heterodox Trotskyism"), "No", () => r(q_workersDemocracyStalin, "Left Marxism-Leninism"));
}

function q_nepTime() {
  q(q_stalinCope, "Was the Soviet Union right in forcefully collectivising agriculture?", "Yes", q_classStruggleSocialism, "No", () => r(q_nepTime, "Bukharinism"));
}

function q_classStruggleSocialism() {
  q(q_nepTime, "Does class struggle continue under socialism?", "Yes", q_chinaBourgeois, "No", q_khrushBrezhnev);
}

function q_khrushBrezhnev() {
  q(q_classStruggleSocialism, "How does socialist society advance toward full communism?", "Planned Development", () => r(q_khrushBrezhnev, "Marxism-Leninism (Khrushchev)"), "Organic Development", () => r(q_khrushBrezhnev, "Developed Socialism"));
}

function q_chinaBourgeois() {
  q(q_classStruggleSocialism, "Was the Chinese revolution a bourgeois revolution?", "Yes", () => r(q_chinaBourgeois, "Anti-Revisionist Marxism-Leninism"), "No", q_peopleWar);
}

function q_peopleWar() {
  q(q_chinaBourgeois, "Should protracted guerrilla warfare be used to remove the old society?", "Yes", q_universalPPW, "No", q_natCom);
}

function q_universalPPW() {
  q(q_peopleWar, "Are these tactics applicable across all countries?", "Yes", () => r(q_universalPPW, "Marxism-Leninism-Maoism, principally Maoism"), "No", q_laborAristocracy);
}

function q_laborAristocracy() {
  q(q_universalPPW, "Is the first world working class an anti-revolutionary one?", "Yes", () => r(q_laborAristocracy, "Maoism Third-Worldism"), "No", q_muhCapitalistRoaders);
}

function q_muhCapitalistRoaders() {
  q(q_laborAristocracy, "Has modern day China taken the capitalist road?", "Yes", () => r(q_muhCapitalistRoaders, "Marxism-Leninism-Maoism"), "No", () => r(q_muhCapitalistRoaders, "Marxism-Leninism-MZT"));
}

function q_natCom() {
  q(q_peopleWar, "Should the revolution's main priority be the nation's liberation?", "Yes", q_songun, "No", () => r(q_natCom, "Marxism-Leninism"));
}

function q_songun() {
  q(q_natCom, "Is giving resource precedence to the military necessary?", "Yes", () => r(q_songun, "Juche"), "No", () => r(q_songun, "National Communism"));
}

function q_partyElites() {
  q(q_massparty, "Should there be a small party of elites to engage in political activity?", "Yes", () => r(q_partyElites, "Council Communism (Organizational Dualism)"), "No", () => r(q_partyElites, "Council Communism (Organizational Unitarism)"));
}

function q_communization() {
  q(q_dotp, "Does revolution mean the self-abolition of the proletariat as a class?", "Yes", q_nature, "No", q_agriculture);
}

function q_nature() {
  q(q_communization, "Does the self-abolition of the proletariat require a complete withdrawal from the society", "Yes", () => r(q_nature, "Camattism"), "No", () => r(q_nature, "Communization (Anarchist)"));
}

function q_agriculture() {
  q(q_communization, "Should agriculture be practiced?", "Yes", q_federation, "No", () => r(q_agriculture, "Anarcho-Primitivism"));
}

function q_federation() {
  q(q_agriculture, "Should a federal anarchist organization exist ?", "Yes", q_anarchosyn, "No", q_egoCom);
}

function q_egoCom() {
  q(q_federation, "Will every individuals fight to liberate their own ego from societies abstractions lead to communism?", "Yes", () => r(q_egoCom, "Ego-Communism"), "No", q_nihlism);
}

function q_nihlism() {
  q(q_egoCom, "There are no demands to be made no Utopic visions to be upheld no political programs to be upheld resistance is pure negation?", "Yes", () => r(q_nihlism, "Anarcho-Nihilism"), "No", q_insurrection);
}

function q_insurrection() {
  q(q_nihlism, "Should violent insurrection be the primary revolutionary practice?", "Yes", () => r(q_insurrection, "Insurrectionary Anarchism"), "No", q_illegalism);
}

function q_illegalism() {
  q(q_insurrection, "Is crime an inherently revolutionary act ?", "Yes", () => r(q_illegalism, "Illegalism"), "No", () => r(q_illegalism, "Individualist Anarchism"));
}

function q_anarchosyn() {
  q(q_federation, "Should an anarchist federation be loosely organized and treat different anarchist ideas equally?", "Yes", q_anarchistTendencies, "No", q_anarchoUnions);
}

function q_anarchistTendencies() {
  q(q_anarchosyn, "Should different anarchist tendencies be united within a common theoretical and organizational framework?", "Yes", () => r(q_anarchistTendencies, "Synthesis Anarchism"), "No", () => r(q_anarchistTendencies, "Anarchism Without Adjectives"));
}

function q_anarchoUnions() {
  q(q_agriculture, "Should revolutionary unions be the primary organizational basis of our struggle and future society?", "Yes", q_proudhon, "No", q_bookchin);
}

function q_proudhon() {
  q(q_anarchoUnions, "Should revolutionary unions, as prefigurative institutions, gradually replace capitalist social relations?", "Yes", () => r(q_proudhon, "Proudhonian Mutualism"), "No", q_myth);
}

function q_myth() {
  q(q_proudhon, "Should we adopt the myth of our victory as our movement's unifier?", "Yes", () => r(q_myth, "Sorelianism"), "No", () => r(q_myth, "Anarcho-Syndicalism"));
}

function q_bookchin() {
  q(q_anarchoUnions, "Should the state be opposed through local direct democracy?", "Yes", q_demconf, "No", q_platform);
}

function q_demconf() {
  q(q_bookchin, "should societal and political structure emphasise Jineology (Feminism) and Multiculturalism?", "Yes", () => r(q_demconf, "Democratic Confederalism"), "No", () => r(q_demconf, "Libertarian Municipalism"));
}

function q_platform() {
  q(q_bookchin, "Should the anarchist organization uphold collective responibility and theoratical and tactical unity?", "Yes", q_massMvmtRoot, "No", q_vouchers);
}

function q_massMvmtRoot() {
  q(q_platform, "Should the principles and organizational structure of an anarchist organization be based on the federative relationship among its members, rather than strict and centralized one?", "Yes", () => r(q_massMvmtRoot, "Especifismo"), "No", () => r(q_massMvmtRoot, "Platformism"));
}

function q_vouchers() {
  q(q_platform, "Should labor vouchers be given in exchange for work?", "Yes", () => r(q_vouchers, "Anarcho-Collectivism"), "No", () => r(q_vouchers, "Anarcho-Communism"));
}

function q_weed() {
  q(q_communism, "Should all conflict be avoided when attempting change?", "Yes", q_experts, "No", q_transition);
}

function q_experts() {
  q(q_weed, "Should an expert committee optimize distribution to eliminate scarcity?", "Yes", () => r(q_experts, "Technocracy"), "No", () => r(q_experts, "Utopian Socialism"));
}

function q_transition() {
  q(q_weed, "Which way should be used to abolish capitalism?", "Election", q_postPolitical, "Revolution", q_dugin);
}

function q_postPolitical() {
  q(q_transition, "Is present-day society post-political?", "Yes", () => r(q_postPolitical, "Smiley Facism"), "No", () => r(q_postPolitical, "Democratic Socialism"));
}

function q_dugin() {
  q(q_transition, "Should we create multipolarity between civilizations?", "Yes", () => r(q_dugin, "Fourth Theory"), "No", q_authSoc);
}

function q_authSoc() {
  q(q_dugin, "Should socialism be built and maintained through centralized authority?", "Yes", q_natSocAuth, "No", q_agrSoc);
}

function q_natSocAuth() {
  q(q_authSoc, "Should the nation come before all else?", "Yes", q_natSynd, "No", () => r(q_natSocAuth, "State Socialism"));
}

function q_natSynd() {
  q(q_natSocAuth, "Should state-coordinated unions organize society?", "Yes", q_natvfu, "No", q_SovietModel);
}

function q_natvfu() {
  q(q_natSynd, "Does the victory of the nation require the construction of a new culture ?", "Yes", q_futurism, "No", q_traditionalValues);
}

function q_traditionalValues() {
  q(q_natvfu, "Should the nation return to traditional values and unite with people who share a similar national identity in order to return to its former glory?", "Yes", () => r(q_traditionalValues, "Falangism"), "No", () => r(q_traditionalValues, "National Syndicalism"));
}

function q_futurism() {
  q(q_natvfu, "Should profession groups partake in policy making ?", "Yes", q_fumivFascfu, "No", () => r(q_natvfu, "Political Futurism"));
}

function q_fumivFascfu() {
  q(q_futurism, "What does the construction of a new culture mean for religion", "Reconstruction", () => r(q_fumivFascfu, "Fiumanism"), "Abolition", () => r(q_fumivFascfu, "Fascist Futurism"));
}

function q_SovietModel() {
  q(q_natSynd, "Should the economy be modelled after the the soviet planned economy?", "Yes", q_nazbolGoal, "No", q_nazbol);
}

function q_nazbolGoal() {
  q(q_SovietModel, "What should the goal of the nationalist movement be?", "National Liberation", () => r(q_nazbolGoal, "National Bolshevism (Niekisch)"), "Empire Building", q_nazbolOrthodoxy);
}

function q_nazbolOrthodoxy() {
  q(q_nazbolGoal, "Should compromises to ideological orthodoxy be made under any circumstances?", "Yes", () => r(q_nazbolOrthodoxy, "National Bolshevism (Limonov)"), "No", () => r(q_nazbolOrthodoxy, "National Bolshevism (NBF)"));
}

function q_nazbol() {
  q(q_SovietModel, "How should the will of the people be executed?", "Vanguard", () => r(q_nazbol, "Ba'athism"), "Parliament", () => r(q_nazbol, "Tridemism"), "Direct Democracy", () => r(q_nazbol, "Third International Theory"));
}

function q_agrSoc() {
  q(q_authSoc, "Should the economy be centered on agriculture?", "Yes", () => r(q_agrSoc, "Agrarian Socialism"), "No", q_unions);
}

function q_unions() {
  q(q_agrSoc, "Should society be organized through unions?", "Yes", () => r(q_unions, "Syndicalism"), "No", () => r(q_unions, "Libertarian Socialism"));
}

/* PRO-PRIVATE PROPERTY TREE */

function q_constitution() {
  q(q_privateProperty, "Should the state take active measures to shape public life?", "Yes", q_stateFunctions, "No", q_minarchy, "The state should not exist", q_counterEcon);
}

function q_minarchy() {
  q(q_constitution, "Should the state only enforce courts, property and defense?", "Yes", () => r(q_minarchy, "Minarchism"), "No", q_distBert);
}

function q_distBert() {
  q(q_minarchy, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_distBert, "Libertarian Distributism"), "No", q_singleTax);
}

function q_singleTax() {
  q(q_distBert, "Should the only tax be a levy on public resource usage?", "Yes", () => r(q_singleTax, "Geolibertarianism"), "No", q_ubi);
}

function q_ubi() {
  q(q_singleTax, "Should there be a universal basic income?", "Yes", () => r(q_ubi, "Social Libertarianism"), "No", q_bertWar);
}

function q_bertWar() {
  q(q_ubi, "Should freedom be spread around the globe by force?", "Yes", () => r(q_bertWar, "Neo-Libertarianism"), "No", q_bertTrad);
}

function q_bertTrad() {
  q(q_bertWar, "Should local communities ensure law and order?", "Yes", () => r(q_bertTrad, "Paleolibertarianism"), "No", () => r(q_bertTrad, "Right-Libertarianism"));
}

function q_counterEcon() {
  q(q_constitution, "Which method should be used to bring down the state?", "Illegal Trade", q_redMarket, "Insurrection", q_anDist);
}

function q_redMarket() {
  q(q_counterEcon, "Should coercive markets be tolerated?", "Yes", () => r(q_redMarket, "Avaritionism"), "No", () => r(q_redMarket, "Agorism"));
}

function q_anDist() {
  q(q_counterEcon, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_anDist, "Anarcho-Distributism"), "No", q_landRent);
}

function q_landRent() {
  q(q_anDist, "Should homesteaded property include the land it is built on?", "Yes", q_coop, "No", () => r(q_landRent, "Geo-Anarchism"));
}

function q_coop() {
  q(q_landRent, "Should property titles granted by subsidies and the state be voided?", "Yes", () => r(q_coop, "Left-Rothbardianism"), "No", q_covenant);
}

function q_covenant() {
  q(q_coop, "Should covenant communities expel unwelcome individuals?", "Yes", q_separation, "No", () => r(q_covenant, "Anarcho-Capitalism"));
}

function q_separation() {
  q(q_covenant, "How should separation of covenants occur?", "Peacefully", () => r(q_separation, "Hoppeanism"), "Aggressively", () => r(q_separation, "Nilssonianism"));
}

function q_stateFunctions() {
  q(q_constitution, "Who should assume state functions?", "Elected officials", q_dist, "Strongman", q_pragmaticStrongman, "Sovereign", q_sovereignOrganic);
}

function q_dist() {
  q(q_stateFunctions, "Should property be mainly owned by families and guilds?", "Yes", q_distNeeds, "No", q_lvt);
}

function q_distNeeds() {
  q(q_dist, "Should people's needs be met unconditionally?", "Yes", () => r(q_distNeeds, "Social Distributism"), "No", () => r(q_distNeeds, "Distributism"));
}

function q_lvt() {
  q(q_dist, "Should land rents be given back to society?", "Yes", q_geoWelf, "No", q_trad);
}

function q_geoWelf() {
  q(q_lvt, "Should the revenue from land rents be spent on welfare?", "Yes", () => r(q_geoWelf, "Social Georgism"), "No", () => r(q_geoWelf, "Georgism"));
}

function q_trad() {
  q(q_lvt, "Should social institutions favor stability over reform?", "Yes", q_safetyNet, "No", q_needs);
}

function q_safetyNet() {
  q(q_trad, "Should a social safety net protect the poor?", "Yes", q_deuxCentQuaranteSixFromages, "No", q_conIntervention);
}

function q_deuxCentQuaranteSixFromages() {
  q(q_safetyNet, "Who should primarily be accountable to the public?", "State officials", () => r(q_deuxCentQuaranteSixFromages, "Dirigisme"), "Social elites", () => r(q_deuxCentQuaranteSixFromages, "Paternalistic Conservatism"));
}

function q_conIntervention() {
  q(q_safetyNet, "Should the government intervene in wars overseas?", "Yes", () => r(q_conIntervention, "Mesoconservatism"), "No", q_con);
}

function q_con() {
  q(q_conIntervention, "Which element is the most important for social stability?", "Institutions", () => r(q_con, "Classical conservatism"), "Identity", q_identityLevel, "Values", () => r(q_con, "Liberal conservatism"));
}

function q_identityLevel() {
  q(q_con, "Which identity level should hold more power?", "National", () => r(q_identityLevel, "National conservatism"), "Regional", () => r(q_identityLevel, "Paleoconservatism"));
}

function q_needs() {
  q(q_trad, "Should people's needs be met unconditionally?", "Yes", q_socCorp, "No", q_regulation);
}

function q_socCorp() {
  q(q_needs, "Should the state enforce collective bargaining?", "Yes", () => r(q_socCorp, "Social Corporatism"), "No", () => r(q_socCorp, "Social Democracy"));
}

function q_regulation() {
  q(q_needs, "Should the economy be tightly regulated?", "Yes", q_fairness, "No", q_nationalLiberalism);
}

function q_fairness() {
  q(q_regulation, "Which kind of fairness should regulation aim to achieve?", "Fair competition", () => r(q_fairness, "Ordoliberalism"), "Fair outcomes", q_liberalJobs);
}

function q_liberalJobs() {
  q(q_fairness, "Should jobs be created if the market doesn't offer enough?", "Yes", () => r(q_liberalJobs, "Social Liberalism"), "No", () => r(q_liberalJobs, "Progressive liberalism"));
}

function q_nationalLiberalism() {
  q(q_regulation, "Should tariffs and subsidies protect strategic interests?", "Yes", () => r(q_nationalLiberalism, "National liberalism"), "No", q_mobility);
}

function q_mobility() {
  q(q_nationalLiberalism, "Should the state subsidize job training and superior education?", "Yes", () => r(q_mobility, "Third way"), "No", q_hegemony);
}

function q_hegemony() {
  q(q_mobility, "What should be the primary means of generating global power?", "Economic leverage", () => r(q_hegemony, "Neoliberalism"), "Military readiness", () => r(q_hegemony, "Neoconservatism"));
}

function q_pragmaticStrongman() {
  q(q_stateFunctions, "Should the regime follow set principles or objectives?", "Yes", q_racism, "No", q_strongmanLegit);
}

function q_strongmanLegit() {
  q(q_pragmaticStrongman, "Where should the strongman's authority mainly come from?", "Charisma", () => r(q_strongmanLegit, "Personal Autocracy"), "Armed forces", () => r(q_strongmanLegit, "Stratocracy"), "Connections", () => r(q_strongmanLegit, "Patronalism"));
}

function q_racism() {
  q(q_pragmaticStrongman, "Should struggle be waged for a race superior to all others?", "Yes", q_naziLarp, "No", q_total);
}

function q_naziLarp() {
  q(q_racism, "How should the struggle for the race manifest itself?", "Politics", q_artaman, "Guerrilla", () => r(q_naziLarp, "Nazi maoism"), "Terrorism", () => r(q_naziLarp, "Siegism"));
}

function q_artaman() {
  q(q_naziLarp, "Should rural life be actively promoted to strengthen the race?", "Yes", () => r(q_artaman, "Agrarian nazism"), "No", q_raceLarp);
}

function q_raceLarp() {
  q(q_artaman, "What gives that race such superiority?", "Biology", () => r(q_raceLarp, "National Socialism"), "Spirits", () => r(q_raceLarp, "Esoteric Fascism"));
}

function q_total() {
  q(q_racism, "Should the state have a role in all aspects of society?", "Yes", q_palingenesis, "No", q_corpo);
}

function q_palingenesis() {
  q(q_total, "Should we secure the nation through a rebirth or revival?", "Yes", q_feudalRebirth, "No", q_castes);
}

function q_feudalRebirth() {
  q(q_palingenesis, "Do you think that this national rebirth or revival will be achieved by returning to feudalism?", "Yes", () => r(q_feudalRebirth, "Strasserism"), "No", q_fashClergy);
}

function q_fashClergy() {
  q(q_palingenesis, "Should the clergy be part of the government?", "Yes", () => r(q_fashClergy, "Clerical Fascism"), "No", () => r(q_fashClergy, "Fascism"));
}

function q_castes() {
  q(q_palingenesis, "Should a system of castes be in place?", "Yes", q_control, "No", () => r(q_castes, "Jacobinism"));
}

function q_control() {
  q(q_castes, "How should control over society be ensured?", "Apathy", () => r(q_control, "Fordism"), "Terror", () => r(q_control, "Orwellianism"));
}

function q_corpo() {
  q(q_total, "Should profession groups partake in policy making?", "Yes", q_corpoFocus, "No", q_natDist);
}

function q_corpoFocus() {
  q(q_corpo, "Whose interests should hold primacy during bargaining?", "State", () => r(q_corpoFocus, "State Corporatism"), "Labor", () => r(q_corpoFocus, "Yellow Socialism"), "Business", () => r(q_corpoFocus, "Developmentalism"));
}

function q_natDist() {
  q(q_corpo, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_natDist, "National Distributism"), "No", q_authWelf);
}

function q_authWelf() {
  q(q_natDist, "Should compliant citizens receive extensive welfare?", "Yes", () => r(q_authWelf, "Social Authoritarianism"), "No", q_soe);
}

function q_soe() {
  q(q_authWelf, "Should the state get involved in the allocation of capital?", "Yes", q_zeBugz, "No", q_klepto);
}

function q_zeBugz() {
  q(q_soe, "Should all actors in supply chains be of equal concern?", "Yes", () => r(q_zeBugz, "Stakeholder Capitalism"), "No", () => r(q_zeBugz, "State Capitalism"));
}

function q_klepto() {
  q(q_soe, "Should state regulations favor large conglomerates?", "Yes", () => r(q_klepto, "Corporatocracy"), "No", () => r(q_klepto, "Autocratic Capitalism"));
}

function q_sovereignOrganic() {
  q(q_stateFunctions, "Should spiritual, economic and political groups be merged?", "Yes", q_spiritualFunctions, "No", q_sovereignType);
}

function q_spiritualFunctions() {
  q(q_sovereignOrganic, "Who should assume spiritual functions?", "Clerics", () => r(q_spiritualFunctions, "Integralism"), "Warriors", () => r(q_spiritualFunctions, "Superfascism"));
}

function q_sovereignType() {
  q(q_sovereignOrganic, "Where should the sovereign's legitimacy come from?", "Inheritance", q_sovereignRole, "Wisdom", () => r(q_sovereignType, "Noocracy"), "God", q_guelph, "Selection", q_electMon, "Strength", q_weak);
}

function q_sovereignRole() {
  q(q_sovereignType, "What should be the sovereign's primary role?", "Judgment", () => r(q_sovereignRole, "Feudal Monarchy"), "Commandment", q_absolute, "Management", () => r(q_sovereignRole, "Cameralism"));
}

function q_absolute() {
  q(q_sovereignRole, "Should the sovereign be equivalent to the state?", "Yes", () => r(q_absolute, "Absolute Monarchy"), "No", () => r(q_absolute, "Hereditary Monarchy"));
}

function q_guelph() {
  q(q_sovereignType, "Which authority should hold primacy over the state?", "Spiritual", () => r(q_guelph, "Theocracy"), "Temporal", q_temporalReligion);
}

function q_temporalReligion() {
  q(q_guelph, "Should temporal authority lead religious institutions?", "Yes", () => r(q_temporalReligion, "Caesaropapism"), "No", () => r(q_temporalReligion, "Divine Monarchy"));
}

function q_electMon() {
  q(q_sovereignType, "What should grant power to select the sovereign?", "Birthright", () => r(q_electMon, "Aristocracy"), "Share Holding", () => r(q_electMon, "Neocameralism"), "Land Ownership", () => r(q_electMon, "Aristotelian timocracy"), "Military Honors", () => r(q_electMon, "Platonic timocracy"));
}

function q_weak() {
  q(q_sovereignType, "Should the weak be subjugated?", "Yes", () => r(q_weak, "Kraterocracy"), "No", () => r(q_weak, "Combatocracy"));
}
