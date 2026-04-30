/**
 * ChatService - AI Core Orchestration + MCP Tool Calling 핸들러
 */
const cds = require('@sap/cds');
const LOG = cds.log('ChatService');
const { chat, getToolDefinitions } = require('./lib/aicore-client');

module.exports = cds.service.impl(async function () {

  /**
   * sendMessage - AI Core Orchestration + MCP 도구 활용 메시지 전송
   */
  this.on('sendMessage', async (req) => {
    const { message, history } = req.data;

    if (!message || !message.trim()) {
      return { reply: '', success: false, error: '메시지를 입력해주세요.' };
    }

    try {
      // 대화 히스토리 구성
      const chatHistory = (history || []).map(h => ({
        role: h.role,
        content: h.content
      }));

      LOG.info(`사용자 메시지: ${message.substring(0, 100)}...`);
      
      const reply = await chat(message, chatHistory);
      
      LOG.info(`AI 응답 수신 (${reply.length}자)`);
      
      return { reply, success: true, error: null };
    } catch (error) {
      LOG.error('Chat 처리 오류:', error.message);
      return {
        reply: '',
        success: false,
        error: `AI 서비스 오류: ${error.message}`
      };
    }
  });

  /**
   * healthCheck - 서비스 상태 확인
   */
  this.on('healthCheck', async (req) => {
    let toolCount = 0;
    try {
      const tools = await getToolDefinitions();
      toolCount = tools.length;
    } catch (e) {
      LOG.warn('MCP Tool 로딩 실패:', e.message);
    }

    const hasConfig = !!(
      process.env.AICORE_SERVICE_KEY ||
      (process.env.AICORE_AUTH_URL && process.env.AICORE_CLIENT_ID)
    );

    return {
      status: 'running',
      aicore: hasConfig,
      mcpTools: toolCount
    };
  });
});