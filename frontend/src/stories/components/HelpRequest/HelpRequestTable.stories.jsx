import React from "react";

import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestTable",
  component: HelpRequestTable,
};

const Template = (args) => {
  return <HelpRequestTable {...args} />;
};

export const ThreeHelpRequests = Template.bind({});

ThreeHelpRequests.args = {
  helpRequests: helpRequestFixtures.threeHelpRequests,
};

export const OneHelpRequest = Template.bind({});

OneHelpRequest.args = {
  helpRequests: [helpRequestFixtures.oneHelpRequest],
};

export const Empty = Template.bind({});

Empty.args = {
  helpRequests: [],
};
