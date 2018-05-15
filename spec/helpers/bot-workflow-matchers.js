beforeEach(() => {
  jasmine.addMatchers({
    toHaveAction: () => {
      return {
        compare: (actual, expected) => {
          expected = Array.isArray(expected) ? expected : [expected];
          return {
            pass: actual 
              && actual.actions 
              && actual.actions.every((x,i) => x.action === expected[i])
          };
        }
      };
    },

    toHavePrompt: () => {
      return {
        compare: (actual, expected) => {
          expected = Array.isArray(expected) ? expected : [expected];
          return {
            pass: actual 
              && actual.actions 
              && actual.actions.some(action =>
                action.playPrompt 
                && action.playPrompt.action == 'playPrompt'
                && action.playPrompt.prompts
                && action.playPrompt.prompts.every((prompt,i) => prompt.value === expected[i]))
          }
        }
      };
    },

    toHaveChoices: () => {
      return {
        compare: (actual, expected) => {
          return {
            pass: actual
              && actual.actions
              && actual.actions.some(action => 
                action.choices
                && action.choices.every((choice, i) => 
                  choice.name === expected[i].name
                  && choice.speechVariation.every((x, j) => x == expected[i].variants[j])
                  && expected[i].dtmf ? choice.dtmfVariation === expected[i].dtmf : !choice.dtmfVariation))
          }
        }
      };
    }
  });
});
