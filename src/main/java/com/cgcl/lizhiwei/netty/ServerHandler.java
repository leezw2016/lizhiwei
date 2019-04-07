package com.cgcl.lizhiwei.netty;

import com.cgcl.lizhiwei.common.JsonUtils;
import com.cgcl.lizhiwei.common.Message;
import com.cgcl.lizhiwei.entity.Point;
import com.cgcl.lizhiwei.websocket.WebSocketServer;
import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelId;
import io.netty.channel.SimpleChannelInboundHandler;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListMap;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since 2019-04-04
 */
@Slf4j
@ChannelHandler.Sharable
public class ServerHandler extends SimpleChannelInboundHandler<String> {

    private static Map<String, List<Point>> lineMap = new ConcurrentHashMap<>();
    private static Map<ChannelId, String> channelIdToLineNameMap = new ConcurrentSkipListMap<>();

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, String msg) throws Exception {
        log.info("接受到的消息为：" + msg);
        try {
            Point point = formatMsg(msg);
            if (!lineMap.containsKey(point.getName())) {
                point.setId(1L);
                List<Point> list = new ArrayList<>();
                list.add(point);
                lineMap.put(point.getName(), list);
                channelIdToLineNameMap.put(ctx.channel().id(), point.getName());
            } else {
                List<Point> list = lineMap.get(point.getName());
                point.setId(list.size() + 1L);
                list.add(point);
            }
            log.info(JsonUtils.toJson(lineMap));
            WebSocketServer.broadCastInfo(getLineMapMessageWraps());
            ctx.writeAndFlush("success");
        } catch (RuntimeException e) {
            log.warn("解析json出错！");
            ctx.writeAndFlush("error, msg=" + msg);
            e.printStackTrace();
        }
    }

    private Point formatMsg(String msg) {
        Map map = JsonUtils.parse(msg.trim(), Map.class);
        Point point = new Point();
        point.setName(map.get("name").toString());
        point.setX(Long.parseLong(map.get("x").toString()));
        point.setY(Double.parseDouble(map.get("y").toString()));
        return point;
    }


    @Override
    public void channelRegistered(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + ": Channel Registered");
    }

    @Override
    public void channelUnregistered(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + ": Channel Unregistered");
        String name = channelIdToLineNameMap.get(ctx.channel().id());
        lineMap.remove(name);
        channelIdToLineNameMap.remove(ctx.channel().id());
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + ": Channel Active");
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + ": Channel Inactive");
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        log.info(ctx.channel().remoteAddress() + ": Channel Read Complete");
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        log.error("Memory information receiver occurs errors!");
        cause.printStackTrace();
        ctx.close();
    }

    public static String getLineMapMessageWraps() {
        return Message.success().add("lineMap", lineMap).toString();
    }
}
