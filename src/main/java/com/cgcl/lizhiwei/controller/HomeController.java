package com.cgcl.lizhiwei.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since 2019-04-04
 */
@Slf4j
@Controller
public class HomeController {
    @RequestMapping("/")
    public String home(){
        return "index";
    }
}
