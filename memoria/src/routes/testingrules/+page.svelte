<script lang="ts">
    import { writable } from 'svelte/store';
    import "../types";
  
      let rules = writable<Rule[]>([]);
      let nextId = 1;
  
      function getUniqueId() {
          return nextId++;
      }
  
      function addConnectorRule(parentComplexRuleId?: number) {
          const newRule: ConnectorRule = {
              id: getUniqueId(),
              type: "Conector",
              logical_operator: "Or",
              logicals: ["And", "Or"],
          };
          updateRuleInComplex(newRule, parentComplexRuleId);
      }
  
      function addSimpleRule(parentComplexRuleId?: number, id?: number) {
          console.log(parentComplexRuleId, id);
          if (parentComplexRuleId != null) {
              if (shouldAddConnector(parentComplexRuleId)) {
                  addConnectorRule(parentComplexRuleId);
              }
          } else {
              if (shouldAddConnectorAtTopLevel()) {
                  addConnectorRule();
              }
          }
          const newRule: SimpleRule = {
              id: getUniqueId(),
              type: "Simple",
              numberRule: get(rules).length + 1,
              attribute: "Product Owner",
              value: "External",
              attributes: ["Product Owner", "Other"],
              values: ["External", "Internal"],
          };
          updateRuleInComplex(newRule, parentComplexRuleId);
      }
  
      function addComplexRule(parentComplexRuleId?: number) {
          console.log(parentComplexRuleId);
          if (parentComplexRuleId != null) {
              if (shouldAddConnector(parentComplexRuleId)) {
                  addConnectorRule(parentComplexRuleId);
              }
          } else {
              if (shouldAddConnectorAtTopLevel()) {
                  addConnectorRule();
              }
          }
          const newRule: ComplexRule = {
              id: getUniqueId(),
              type: "Complex",
              numberRule: get(rules).length + 1,
              rules: [],
          };
          updateRuleInComplex(newRule, parentComplexRuleId);
      }
  
      function deleteRuleById(ruleId: number) {
          rules.update((currentRules) => {
              return removeRule(currentRules, ruleId);
          });
      }
  
      function removeRule(rulesList: Rule[], ruleId: number): Rule[] {
          for (let i = 0; i < rulesList.length; i++) {
              const rule = rulesList[i];
              if (rule.id === ruleId) {
                  // Check if previous rule is a connector and remove it
                  if (i > 0 && rulesList[i - 1].type === "Conector") {
                      rulesList.splice(i - 1, 2);
                  } else if (
                      i < rulesList.length - 1 &&
                      rulesList[i + 1].type === "Conector"
                  ) {
                      rulesList.splice(i, 2);
                  } else {
                      rulesList.splice(i, 1);
                  }
                  return rulesList;
              } else if (rule.type === "Complex") {
                  rule.rules = removeRule(rule.rules, ruleId);
              }
          }
          return rulesList;
      }
  
      function shouldAddConnector(parentComplexRuleId: number): boolean {
          const parentRule = findRuleById(get(rules), parentComplexRuleId);
          return (
              parentRule !== null &&
              parentRule.type === "Complex" &&
              parentRule.rules.length > 0 &&
              parentRule.rules.slice(-1)[0].type !== "Conector"
          );
      }
  
      function shouldAddConnectorAtTopLevel(): boolean {
          const topLevelRules = get(rules);
          return (
              topLevelRules.length > 0 &&
              topLevelRules.slice(-1)[0].type !== "Conector"
          );
      }
  
      function updateRuleInComplex(
          newRule: Rule,
          parentComplexRuleId: number | undefined,
      ) {
          if (parentComplexRuleId != null) {
              rules.update((rs) => {
                  let parentRule = findRuleById(rs, parentComplexRuleId);
                  if (parentRule && parentRule.type === "Complex") {
                      parentRule.rules.push(newRule);
                  }
                  return rs;
              });
          } else {
              rules.update((currentRules) => [...currentRules, newRule]);
          }
      }
  
      function findRuleById(rules: Rule[], id: number): Rule | null {
          for (let rule of rules) {
              if (rule.id === id) {
                  return rule;
              }
              if (rule.type === "Complex") {
                  let found = findRuleById(rule.rules, id);
                  if (found) {
                      return found;
                  }
              }
          }
          return null;
      }
  </script>
  
  <div class="w-full h-full">
      <div class="flex flex-row mt-10">
          <div class="w-1/2 p-5 overflow-y-auto h-[500px] border-2 border-black">
              {#each $rules as rule}
                  {#if rule.type == "Simple"}
                      <div
                          class="relative flex flex-col text-center mx-auto border-2 border-[#9593f1] rounded-xl w-[200px]"
                      >
                          <button
                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                              on:click={() => deleteRuleById(rule.id)}
                          >
                              1
                              <span
                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                              >
                                  delete
                              </span>
                          </button>
                          <h1>{rule.numberRule}</h1>
                          <h1>{rule.attribute}</h1>
                          <h1>{rule.value}</h1>
                      </div>
                  {:else if rule.type == "Conector"}
                      <div
                          class="flex flex-col text-center mx-auto border-2 border-[#d8993d] rounded-xl w-[150px]"
                      >
                          <h1>{rule.logical_operator}</h1>
                      </div>
                  {:else if rule.type == "Complex"}
                      <div
                          class="relative flex flex-col text-center mx-auto border-2 border-[#8649ec] rounded-xl w-[400px] py-5"
                      >
                          <button
                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                              on:click={() => deleteRuleById(rule.id)}
                          >
                              <span
                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                              >
                                  2 delete
                              </span>
                          </button>
                          <h1>{rule.numberRule}</h1>
                          <div>
                              {#each rule.rules ?? [] as subrule}
                                  {#if subrule.type == "Simple"}
                                      <div
                                          class="relative mx-auto text-center rounded border-2 w-[200px] border-[#8649ec]"
                                      >
                                          <button
                                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                              on:click={() =>
                                                  deleteRuleById(subrule.id)}
                                          >
                                              3
                                              <span
                                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                                              >
                                                  delete
                                              </span>
                                          </button>
                                          <h1>{subrule.type}</h1>
                                      </div>
                                  {:else if subrule.type == "Conector"}
                                      <div
                                          class="flex flex-col text-center mx-auto border-2 border-[#d8993d] rounded-xl w-[100px]"
                                      >
                                          <h1>{subrule.logical_operator}</h1>
                                      </div>
                                  {:else if subrule.type == "Complex"}
                                      <div
                                          class="relative flex flex-col text-center mx-auto border-2 border-[#8649ec] rounded-xl w-[300px] py-5"
                                      >
                                          <button
                                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                              on:click={() =>
                                                  deleteRuleById(subrule.id)}
                                          >
                                              4
                                              <span
                                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                                              >
                                                  delete
                                              </span>
                                          </button>
                                          <h1>{subrule.numberRule}</h1>
                                          <div>
                                              {#each subrule.rules ?? [] as subsubrule}
                                                  {#if subsubrule.type == "Simple"}
                                                      <div
                                                          class="relative mx-auto text-center rounded border-2 w-[200px] border-[#8649ec]"
                                                      >
                                                          <button
                                                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                                              on:click={() =>
                                                                  deleteRuleById(
                                                                      subsubrule.id,
                                                                  )}
                                                          >
                                                              5
                                                              <span
                                                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                                                              >
                                                                  delete
                                                              </span>
                                                          </button>
                                                          <h1>
                                                              {subsubrule.type}
                                                          </h1>
                                                      </div>
                                                  {:else if subsubrule.type == "Conector"}
                                                      <div
                                                          class="flex flex-col text-center mx-auto border-2 border-[#d8993d] rounded-xl w-[100px]"
                                                      >
                                                          <h1>
                                                              {subsubrule.logical_operator}
                                                          </h1>
                                                      </div>
                                                  {:else if subsubrule.type == "Complex"}
                                                      <div
                                                          class="relative flex flex-col text-center mx-auto border-2 border-[#8649ec] rounded-xl w-[300px] py-5"
                                                      >
                                                          <button
                                                              class="absolute top-0 right-0 -mt-4 -mr-4 bg-[#ce4f2c] text-white rounded-full px-1"
                                                              on:click={() =>
                                                                  deleteRuleById(
                                                                      subsubrule.id,
                                                                  )}
                                                          >
                                                              6
                                                              <span
                                                                  class="mx-2 my-1 text-sm material-symbols-outlined"
                                                              >
                                                                  delete
                                                              </span>
                                                          </button>
                                                          <h1>
                                                              {subsubrule.numberRule}
                                                          </h1>
                                                      </div>
                                                  {:else}
                                                      <div
                                                          class="flex flex-col text-center mx-auto border-2 border-[#d8993d] rounded-xl w-[100px]"
                                                      >
                                                          <h1>
                                                              {subsubrule}
                                                          </h1>
                                                      </div>
                                                  {/if}
                                              {/each}
                                          </div>
                                          <div
                                              class="flex bg-[#9593f1] mx-auto w-[5px] h-[20px]"
                                          ></div>
                                          <div
                                              class="flex mx-auto justify-center w-1/2 text-xs"
                                          >
                                              <button
                                                  class="bg-[#9593f1] rounded text-white font-bold py-2 px-4"
                                                  on:click={() =>
                                                      addSimpleRule(
                                                          subrule.id,
                                                          rule.id,
                                                      )}
                                              >
                                                  Add Simple Rule for SubComplex
                                              </button>
                                          </div>
                                      </div>
                                  {/if}
                              {/each}
                          </div>
                          <div
                              class="flex bg-[#9593f1] mx-auto w-[5px] h-[20px]"
                          ></div>
                          <div class="flex mx-auto justify-center w-1/2 text-xs">
                              <button
                                  class="bg-[#9593f1] rounded text-white font-bold py-2 px-4"
                                  on:click={() => addSimpleRule(rule.id)}
                              >
                                  Add Simple Rule for Complex
                              </button>
                              <button
                                  class="bg-[#9593f1] rounded text-white font-bold py-2 px-4"
                                  on:click={() => addComplexRule(rule.id)}
                              >
                                  Add Complex Rule for Complex
                              </button>
                          </div>
                      </div>
                  {/if}
              {/each}
              <div class="flex bg-[#9593f1] mx-auto w-[5px] h-[20px]"></div>
              <div class="flex mx-auto justify-center">
                  <button
                      class="bg-[#9593f1] rounded text-white font-bold py-2 px-4"
                      on:click={() => addSimpleRule()}
                  >
                      Add Simple Rule
                  </button>
                  <button
                      class="bg-[#9593f1] rounded text-white font-bold py-2 px-4"
                      on:click={() => addComplexRule()}
                  >
                      Add Complex Rule
                  </button>
              </div>
          </div>
          <div class="w-1/2 overflow-y-auto h-[500px] border-2 border-black">
              {#each $rules as rule}
                  <div class="text-xs">
                      <pre>{JSON.stringify(rule, null, 2)}</pre>
                  </div>
              {/each}
          </div>
      </div>
  </div>