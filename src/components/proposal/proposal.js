"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Proposal = void 0;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var react_native_1 = require("react-native");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var colors_1 = require("@app/colors");
var ui_1 = require("@app/components/ui");
var helpers_1 = require("@app/helpers");
var hooks_1 = require("@app/hooks");
var i18n_1 = require("@app/i18n");
var governance_voting_1 = require("@app/models/governance-voting");
var wallet_1 = require("@app/models/wallet");
var proposal_1 = require("@app/variables/proposal");
var votes_1 = require("@app/variables/votes");
var voting_card_detail_1 = require("./voting-card-detail");
function Proposal(_a) {
    var _this = this;
    var item = _a.item /*, onDepositSubmit*/;
    var bottom = (0, react_native_safe_area_context_1.useSafeAreaInsets)().bottom;
    var cardRef = (0, react_1.useRef)();
    var voteSelectedRef = (0, react_1.useRef)();
    var _b = (0, react_1.useState)(), vote = _b[0], setVote = _b[1];
    var _c = (0, react_1.useState)(0), collectedDeposit = _c[0], setCollectedDeposit = _c[1];
    var cosmos = (0, hooks_1.useCosmos)();
    var app = (0, hooks_1.useApp)();
    var visible = (0, hooks_1.useWalletsList)().visible;
    var closeDistance = (0, react_native_1.useWindowDimensions)().height / 6;
    // const onDeposit = () => {
    //   showModal('wallets-bottom-sheet', {
    //     wallets: visible,
    //     closeDistance,
    //     title: I18N.proposalAccountTitle,
    //     eventSuffix: '-proposal-deposit',
    //   });
    //   if (onDepositSubmit) {
    //     app.addListener('wallet-selected-proposal-deposit', onDepositSubmit);
    //   }
    // };
    (0, react_1.useEffect)(function () {
        var onVotedSubmit = function (address) { return __awaiter(_this, void 0, void 0, function () {
            var opinion, wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opinion = votes_1.VOTES.findIndex(function (v) { return v.name === voteSelectedRef.current; });
                        wallet = wallet_1.Wallet.getById(address);
                        if (!(wallet && item)) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, cosmos.vote(wallet.transport, item.orderNumber, opinion)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        app.addListener('wallet-selected-proposal', onVotedSubmit);
        return function () {
            app.removeListener('wallet-selected-proposal', onVotedSubmit);
        };
    }, [app, item, cosmos]);
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        item && ((_a = cardRef.current) === null || _a === void 0 ? void 0 : _a.updateNotEnoughProgress(item.yesPercent / 100));
        (_b = cardRef.current) === null || _b === void 0 ? void 0 : _b.updateDepositProgress(collectedDeposit / ((_c = item === null || item === void 0 ? void 0 : item.proposalDepositNeeds) !== null && _c !== void 0 ? _c : 0));
    }, [collectedDeposit, item]);
    (0, react_1.useEffect)(function () {
        if ((item === null || item === void 0 ? void 0 : item.status) === 'voting') {
            (0, helpers_1.showModal)('proposal-vote', { eventSuffix: '-proposal' });
            var onVote_1 = function (decision) {
                var _a;
                voteSelectedRef.current = decision;
                (_a = cardRef.current) === null || _a === void 0 ? void 0 : _a.setSelected(decision);
                (0, helpers_1.showModal)('wallets-bottom-sheet', {
                    wallets: visible,
                    closeDistance: closeDistance,
                    title: i18n_1.I18N.proposalAccountTitle,
                    eventSuffix: '-proposal'
                });
            };
            var onVoteChange_1 = function (decision) {
                var _a;
                (_a = cardRef.current) === null || _a === void 0 ? void 0 : _a.setSelected(decision);
                setVote(decision);
            };
            app.on('proposal-vote-proposal', onVote_1);
            app.on('proposal-vote-change-proposal', onVoteChange_1);
            return function () {
                app.off('proposal-vote-proposal', onVote_1);
                app.off('proposal-vote-change-proposal', onVoteChange_1);
            };
        }
    }, [app, item, closeDistance, visible]);
    (0, react_1.useEffect)(function () {
        cosmos.getProposalDeposits(item.orderNumber).then(function (voter) {
            var sum = governance_voting_1.GovernanceVoting.depositSum(voter);
            setCollectedDeposit(sum);
        });
        // if (item?.orderNumber) {
        //   (async () => {
        //     const details = await cosmos.getProposalDetails(id);
        //     // setDetails({
        //     // })
        //     console.log('🚀 - details', JSON.stringify(response.proposal));
        //   })();
        // }
    }, [item.orderNumber, cosmos]);
    if (!item) {
        return <></>;
    }
    var status = item.status, orderNumber = item.orderNumber, title = item.title, description = item.description, isDeposited = item.isDeposited;
    var badgePropsByStatus = function () {
        var props = proposal_1.ProposalsTags.find(function (tag) { return tag[0] === status; });
        return {
            i18n: props === null || props === void 0 ? void 0 : props[1],
            labelColor: props === null || props === void 0 ? void 0 : props[2],
            textColor: props === null || props === void 0 ? void 0 : props[3],
            iconLeftName: props === null || props === void 0 ? void 0 : props[4]
        };
    };
    return (<>
      <react_native_1.ScrollView contentContainerStyle={styles.container}>
        <ui_1.Spacer height={24}/>
        <ui_1.Badge center {...badgePropsByStatus()}/>
        <ui_1.Spacer height={16}/>
        <ui_1.Text center color={colors_1.Color.textBase1} t14>
          #{orderNumber}
        </ui_1.Text>
        <ui_1.Spacer height={2}/>
        <ui_1.Text center t5>
          {title}
        </ui_1.Text>
        <ui_1.Spacer height={24}/>
        <voting_card_detail_1.VotingCardDetail totalCollected={collectedDeposit} yourVote={vote} ref={cardRef} item={item}/>
        {isDeposited && (<ui_1.InfoBlock style={styles.infoBlockMargin} warning t14 icon={<ui_1.Icon name="warning" color={colors_1.Color.textYellow1}/>} i18n={i18n_1.I18N.proposalDepositAttention}/>)}
        <ui_1.Spacer height={24}/>
        <ui_1.Text t9 i18n={i18n_1.I18N.proposalInfo}/>

        <react_native_1.View style={styles.row}>
          <react_native_1.View style={styles.block}>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalType}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>PASS</ui_1.Text>
          </react_native_1.View>
          <ui_1.Spacer width={16}/>
          <react_native_1.View style={styles.block}>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalTotalDeposit}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>PASS</ui_1.Text>
          </react_native_1.View>
        </react_native_1.View>

        <react_native_1.View style={styles.block}>
          <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalDescription}/>
          <ui_1.Spacer height={4}/>
          <ui_1.Text t14>{description}</ui_1.Text>
        </react_native_1.View>

        <ui_1.Spacer height={24}/>
        <ui_1.Text t9 i18n={i18n_1.I18N.proposalChanges}/>
        <ui_1.Spacer height={12}/>
        <react_native_1.View style={styles.codeBlock}>
          <ui_1.Text t14 color={colors_1.Color.textBase1}>
            {"[\n  PASS\n]"}
          </ui_1.Text>
        </react_native_1.View>

        <ui_1.Spacer height={24}/>
        <ui_1.Text t9 i18n={i18n_1.I18N.proposalDate}/>
        <react_native_1.View style={styles.row}>
          <react_native_1.View style={styles.block}>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalCreatedAt}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>
              {item.createdAt && (0, date_fns_1.format)(item.createdAt, 'dd MMM yyyy, H:mm')}
            </ui_1.Text>
            <ui_1.Spacer height={8}/>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalVoteStart}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>
              {item.dateStart && (0, date_fns_1.format)(item.dateStart, 'dd MMM yyyy, H:mm')}
            </ui_1.Text>
          </react_native_1.View>
          <ui_1.Spacer width={16}/>
          <react_native_1.View style={styles.block}>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalDepositEnd}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>
              {item.depositEnd && (0, date_fns_1.format)(item.depositEnd, 'dd MMM yyyy, H:mm')}
            </ui_1.Text>
            <ui_1.Spacer height={8}/>
            <ui_1.Text t14 color={colors_1.Color.textBase2} i18n={i18n_1.I18N.proposalVoteEnd}/>
            <ui_1.Spacer height={4}/>
            <ui_1.Text t14>
              {item.dateEnd && (0, date_fns_1.format)(item.dateEnd, 'dd MMM yyyy, H:mm')}
            </ui_1.Text>
          </react_native_1.View>
        </react_native_1.View>
        <ui_1.Spacer height={(isDeposited ? 0 : bottom) + 28}/>
      </react_native_1.ScrollView>
      {/* {isDeposited && (
          <View style={styles.depositButtonContainer}>
            <Button
              variant={ButtonVariant.contained}
              onPress={onDeposit}
              i18n={I18N.proposalDeposit}
            />
            <Spacer height={bottom} />
          </View>
        )} */}
    </>);
}
exports.Proposal = Proposal;
var styles = (0, helpers_1.createTheme)({
    container: {
        paddingHorizontal: 20
    },
    block: {
        marginTop: 12,
        flex: 1
    },
    row: {
        flexDirection: 'row'
    },
    codeBlock: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors_1.Color.graphicSecond1,
        padding: 12
    },
    infoBlockMargin: {
        marginTop: 8
    }
});
