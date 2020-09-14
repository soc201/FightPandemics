import PrivacyPolicy from '../../../elements/pages/privacyPolicy'



describe('FightPandemics.com-Privacy Policy Page', () => {
    const  privacyPolicy = new PrivacyPolicy();


    context('Review of Privacy Policy for a user ', () => {
        beforeEach(() => {
            privacyPolicy.visit();
        });

        
         it('Privacy Policy page contains heading ', () => {     
    
            var policyTitle = "Privacy Policy";
            
            privacyPolicy.getPrivacyPolicyPageTitleLocator().should('be.visible').contains(policyTitle);
        }); 

        it('Privacy Policy- FP name checking',() => {
            var fpName="FightPandemics, INC.";
        privacyPolicy.getFpNameCheckingLocator().should('be.visible').contains(fpName);
        
        });


        it('Privacy Policy- Checking Personal data- in its paragraph' ,() => {
            var personalData="Personal data";
            privacyPolicy.getPersonalDataParagraphLocator().should('be.visible').contains(personalData);
        
        });


    });

});