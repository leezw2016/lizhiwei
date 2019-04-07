package com.cgcl.lizhiwei.entity;

import com.cgcl.lizhiwei.common.JsonUtils;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * <p>
 *
 * </p>
 *
 * @author Liu Cong
 * @since 2019-04-07
 */
@Data
public class Line implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<Point> pointList;


    @Override
    public String toString() {
        return JsonUtils.toJson(this);
    }
}
