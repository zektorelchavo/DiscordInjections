const pack = require('../package.json');
const changelog = require('../changelog.json');

module.exports = function (forced = false) {
    if (forced) { postChangelog(); return; }
    let diNode = window.DI.localStorage.getItem('DI-DiscordInjections');
    if (diNode === null) {
        window.DI.localStorage.setItem('DI-DiscordInjections', JSON.stringify({ lastChangelog: pack.version }));
        postChangelog();
    } else {
        diNode = JSON.parse(diNode);
        if (!diNode.lastChangelog || diNode.lastChangelog !== pack.version) {
            diNode.lastChangelog = pack.version;
            postChangelog();
            window.DI.localStorage.setItem('DI-DiscordInjections', JSON.stringify(diNode));
        }
    }
};

function postChangelog() {
    let output = [];
    let keys = Object.keys(changelog).slice(0, 5);
    for (const version of keys) {
        //  if (version != pack.version) {
        //       output.push('<div class="divider-1G01Z9 dividerDefault-77PXsz" style="margin: 10px 0"></div>');
        //  }
        // output.push(`
        //  <h4 class="h4-2IXpeI title-1pmpPr title-1PW5Fd size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">
        //      Version ${version}
        //  </h4>`);
        output.push(`<h1 class="added-3Q7OGu title-1PW5Fd marginTop-4_cfcL marginTop20-3UscxH" ${version !== pack.version ? '' : 'style="margin-top: 0px !important"'}>Version ${version}</h1>`);
        for (const key in changelog[version]) {
            let temp = '';
            //   if (version === pack.version) {
            //       temp = `<h1 class="added-3Q7OGu title-1PW5Fd marginTop-4_cfcL marginTop20-3UscxH">${key}</h1>`;
            //    } else {
            temp = `<h5 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl marginTop20-3UscxH weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q">${key}</h5>`;
            //            temp = `<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn">${key}</div>                `;
            //   }
            temp += '<ul>' + changelog[version][key].map(k => `<li>${k}</li>`).join('\n') + '</ul>';
            output.push(temp);
        }
    }

    DI.Helpers.createModal(`<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE">
    <div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
        <h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">
            DiscordInjections Changelog
        </h4>
        <div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn">Current Version: ${pack.version}</div>
    </div>
    <svg class="close-3ejNTg flexChild-1KGW5q DI-modal-close-button" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
</div>
<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
    <div class="scroller-fzNley inner-tqJwAU content-3KEfmo">
    ${output.join('\n')}
</div></div> 
`);
}