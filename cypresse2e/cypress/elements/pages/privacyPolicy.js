class PrivacyPolicy{

privacyPolicyPageTitle="h2";
//fpNameChecking=".sc-fznXWL > :nth-child(2) > :nth-child(1)";
fpNameChecking=".sc-fznXWL > :nth-child(2)";
//personalDataParagraph=":nth-child(4) > strong";
personalDataParagraph=".sc-fznXWL > :nth-child(4)";



constructor(){}

visit(){

    cy.visit("/privacy-policy");
}

getPrivacyPolicyPageTitleLocator(){
    return cy.get(this.privacyPolicyPageTitle);
}

getFpNameCheckingLocator(){
    return cy.get(this.fpNameChecking);
}

getPersonalDataParagraphLocator(){
    return cy.get(this.personalDataParagraph);
}



}

export default PrivacyPolicy;